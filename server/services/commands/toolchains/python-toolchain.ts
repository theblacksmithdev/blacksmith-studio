import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BinaryDetector } from "../detectors/binary-detector.js";
import {
  PythonVenvDetector,
  type PythonEnvDetection,
} from "../detectors/python-venv-detector.js";
import { NoProjectEnvError, NoStudioEnvError } from "../errors.js";
import { PlatformInfo } from "../../platform/index.js";
import { UvBinaryResolver } from "../../python/uv-binary.js";
import { detectPythonInstallations } from "../../python/detect-python.js";
import { projectDataDir } from "../../project-paths.js";
import type {
  EnvCreatingToolchain,
  EnvDeletingToolchain,
  EnvLifecycleContext,
  InstalledVersion,
  ProjectContext,
  ResolvedBinary,
  StudioContext,
  ToolchainEnv,
} from "./types.js";

/**
 * Python toolchain implementation.
 *
 * Owns: python, pip, uv, pytest presets. Consolidates what was spread
 * across `server/services/python/*` and `pythonEnv()`. Existing helpers
 * will be rewritten (Phase 5) to delegate to an instance of this class.
 *
 * SOLID notes:
 *   - SRP: only Python-ecosystem knowledge; detection is delegated to
 *     `PythonVenvDetector`, binary lookup to `BinaryDetector`.
 *   - DIP: detectors injected through the constructor so tests
 *     substitute fakes.
 *   - ISP: implements the base `Toolchain` interface only; env-creation
 *     lives elsewhere (Phase 1 does not yet expose `create_project_env`).
 */
export class PythonToolchain
  implements EnvCreatingToolchain, EnvDeletingToolchain
{
  readonly id = "python";
  readonly displayName = "Python";
  readonly binaries = ["python", "python3", "pip", "pip3", "uv", "pytest"] as const;
  readonly presetOwnership = [
    "python",
    "pip",
    "uv",
    "pytest",
    "python3",
    "pip3",
  ] as const;

  constructor(
    private readonly venvDetector: PythonVenvDetector,
    private readonly binaries_: BinaryDetector,
    private readonly platform: PlatformInfo,
    private readonly uv: UvBinaryResolver,
  ) {}

  detectStudioEnv(ctx: StudioContext): ToolchainEnv | null {
    // Studio venv lives at ~/.blacksmith-studio/venv/ and is managed by
    // PackageManager via the bundled uv. We only report it as an env
    // when the interpreter actually exists on disk.
    const root = path.join(ctx.studioRoot, "venv");
    const bin = path.join(root, this.platform.venvBinDir);
    const pythonPath = path.join(bin, this.platform.binaryName("python"));
    if (!this.binaries_.firstExisting([pythonPath])) return null;
    return {
      scope: "studio",
      toolchainId: this.id,
      displayName: "Blacksmith studio venv",
      root,
      bin,
      envVars: { VIRTUAL_ENV: root, PYTHONHOME: "" },
    };
  }

  detectProjectEnv(ctx: ProjectContext): ToolchainEnv | null {
    // Explicit override short-circuits every other strategy.
    if (ctx.explicitPath && this.binaries_.firstExisting([ctx.explicitPath])) {
      const bin = path.dirname(ctx.explicitPath);
      return {
        scope: "project",
        toolchainId: this.id,
        displayName: `explicit: ${ctx.explicitPath}`,
        root: path.dirname(bin),
        bin,
        envVars: {},
      };
    }
    const detection = this.venvDetector.detect(ctx.projectRoot);
    if (!detection) return null;
    return this.toEnv(detection);
  }

  resolveBinary(binary: string, env: ToolchainEnv): ResolvedBinary {
    // Wrapper-based envs (Poetry / Pipenv / conda / pyenv) go through
    // their invoker. The actual runtime binary follows as an arg.
    if (env.invoker) {
      return {
        command: env.invoker.command,
        prependArgs: [...env.invoker.args, canonicalName(binary)],
      };
    }
    const candidate = path.join(env.bin, this.platform.binaryName(binary));
    const resolved = this.binaries_.firstExisting([candidate]);
    if (resolved) return { command: resolved, prependArgs: [] };
    // Fall back to PATH (set by envVars) so `python` still works when
    // the env contributes it via PATH but not through a well-known
    // bin/ layout.
    return { command: canonicalName(binary), prependArgs: [] };
  }

  async checkAvailable(
    env: ToolchainEnv,
  ): Promise<{ ok: boolean; version?: string; error?: string }> {
    const python = this.resolveBinary("python", env);
    try {
      const out = execFileSync(
        python.command,
        [...python.prependArgs, "--version"],
        { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"], timeout: 5000 },
      ).trim();
      return { ok: true, version: out };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  /**
   * Fail-fast helper the resolver uses when the caller asks for a
   * project-scoped Python and no env is detected. Typed so the IPC /
   * MCP layer can render a structured error.
   */
  requireProjectEnv(ctx: ProjectContext): ToolchainEnv {
    const env = this.detectProjectEnv(ctx);
    if (!env) throw new NoProjectEnvError(this.id, ctx.projectRoot);
    return env;
  }

  requireStudioEnv(ctx: StudioContext): ToolchainEnv {
    const env = this.detectStudioEnv(ctx);
    if (!env) throw new NoStudioEnvError(this.id);
    return env;
  }

  /**
   * Bootstrap a venv via the bundled uv binary.
   *
   *   · scope "project" → `<projectRoot>/.blacksmith/.venv/`
   *   · scope "studio"  → `<studioRoot>/venv/` (shared across projects)
   *
   * `.blacksmith/` is gitignored by the ArtifactManager so the project
   * root stays clean. `python` accepts a version ("3.12") or an
   * absolute interpreter path — uv handles both via `--python`.
   */
  async createEnv(
    ctx: EnvLifecycleContext,
    options: { python?: string; overwrite?: boolean } = {},
  ): Promise<ToolchainEnv> {
    const target = this.venvTargetFor(ctx);
    if (options.overwrite && fs.existsSync(target.venvPath)) {
      fs.rmSync(target.venvPath, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(target.venvPath), { recursive: true });
    const uvBin = this.uv.resolve();
    const args = ["venv", target.venvPath];
    if (options.python) args.push("--python", options.python);
    await runOnce(uvBin, args, target.cwd);
    const env = this.detectFor(ctx);
    if (!env) {
      throw new Error(
        `uv venv succeeded but the venv isn't detectable at ${target.venvPath}.`,
      );
    }
    return env;
  }

  async listInstalledVersions(): Promise<InstalledVersion[]> {
    return detectPythonInstallations().map((install) => ({
      displayName: install.label,
      path: install.path,
      version: install.version,
      source: classifySource(install.label),
    }));
  }

  /**
   * Tear down the Blacksmith-managed venv for the given scope. Only
   * removes the app-owned directory — legacy root-level `.venv` /
   * `venv` and wrapper envs (Poetry / Pipenv / conda) are untouched
   * because the app didn't create them.
   */
  async deleteEnv(ctx: EnvLifecycleContext): Promise<void> {
    const { venvPath } = this.venvTargetFor(ctx);
    if (fs.existsSync(venvPath)) {
      fs.rmSync(venvPath, { recursive: true, force: true });
    }
  }

  /** Absolute path of the studio venv directory. Public so legacy
   *  callers (PackageManager) can point at the same folder. */
  studioVenvPath(studioRoot: string): string {
    return path.join(studioRoot, "venv");
  }

  private venvTargetFor(
    ctx: EnvLifecycleContext,
  ): { venvPath: string; cwd: string } {
    if (ctx.scope === "studio") {
      return {
        venvPath: this.studioVenvPath(ctx.studioRoot),
        cwd: ctx.studioRoot,
      };
    }
    return {
      venvPath: projectDataDir(ctx.projectRoot, ".venv"),
      cwd: ctx.projectRoot,
    };
  }

  private detectFor(ctx: EnvLifecycleContext): ToolchainEnv | null {
    return ctx.scope === "studio"
      ? this.detectStudioEnv(ctx)
      : this.detectProjectEnv(ctx);
  }

  private toEnv(d: PythonEnvDetection): ToolchainEnv {
    const envVars: Record<string, string> = {};
    if (d.kind === "venv") {
      envVars.VIRTUAL_ENV = d.root;
      envVars.PYTHONHOME = "";
    }
    return {
      scope: "project",
      toolchainId: this.id,
      displayName: d.displayName,
      root: d.root,
      bin: d.bin,
      envVars,
      invoker: d.invoker,
    };
  }
}

function classifySource(label: string): InstalledVersion["source"] {
  const lower = label.toLowerCase();
  if (lower.startsWith("default")) return "default";
  if (lower.startsWith("pyenv")) return "pyenv";
  if (
    lower.startsWith("conda") ||
    lower.includes("miniconda") ||
    lower.includes("miniforge") ||
    lower.includes("anaconda")
  ) {
    return "conda";
  }
  if (lower.includes("homebrew") || lower.startsWith("system")) return "system";
  return "other";
}

function canonicalName(binary: string): string {
  // Poetry / Pipenv / conda accept `python` consistently — normalise
  // `python3` to `python` when passing through a wrapper so callers
  // don't have to know which flavour the host has installed.
  if (binary === "python3") return "python";
  if (binary === "pip3") return "pip";
  return binary;
}

/**
 * Minimal promise-based spawn used by `createEnv`. We avoid going
 * through `CommandRunner` here to keep the toolchain testable in
 * isolation and to sidestep audit/event emission for bootstrap runs.
 */
function runOnce(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr?.setEncoding("utf8").on("data", (d: string) => {
      stderr += d;
    });
    child.on("error", (err) =>
      reject(new Error(`Failed to spawn ${command}: ${err.message}`)),
    );
    child.on("close", (code) => {
      if (code === 0) return resolve();
      const tail = stderr.trim().split("\n").slice(-5).join("\n");
      reject(
        new Error(
          `${command} ${args.join(" ")} exited ${code}${tail ? `\n${tail}` : ""}`,
        ),
      );
    });
  });
}
