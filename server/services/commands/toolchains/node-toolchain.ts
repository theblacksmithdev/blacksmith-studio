import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BinaryDetector } from "../detectors/binary-detector.js";
import {
  NodeVersionDetector,
  type NodeVersionHint,
} from "../detectors/node-version-detector.js";
import { NoProjectEnvError, NoStudioEnvError } from "../errors.js";
import { PlatformInfo } from "../../platform/index.js";
import { detectNodeInstallations } from "../../runner/detect-node.js";
import type {
  InstalledVersion,
  ProjectContext,
  ResolvedBinary,
  StudioContext,
  Toolchain,
  ToolchainEnv,
} from "./types.js";

/**
 * Node toolchain implementation.
 *
 * Owns: node, npm, npx, pnpm, yarn presets. Consolidates `nodeEnv()` +
 * `detectNodeInstallations()`. Handles `.nvmrc` / `engines.node`
 * resolution against nvm / fnm installations discovered on the system.
 *
 * Same SOLID discipline as PythonToolchain — detection is delegated,
 * dependencies injected.
 */
export class NodeToolchain implements Toolchain {
  readonly id = "node";
  readonly displayName = "Node.js";
  readonly binaries = ["node", "npm", "npx", "pnpm", "yarn"] as const;
  readonly presetOwnership = [
    "node",
    "npm",
    "npx",
    "pnpm",
    "yarn",
  ] as const;

  constructor(
    private readonly versionDetector: NodeVersionDetector,
    private readonly binaries_: BinaryDetector,
    private readonly platform: PlatformInfo,
  ) {}

  detectStudioEnv(_ctx: StudioContext): ToolchainEnv | null {
    // Studio uses whichever Node Electron bundles; there's no Blacksmith-
    // owned Node install today. Returning null means consumers must
    // supply a project-scoped env or fall through to a raw call.
    const nodePath = this.binaries_.whichFromPath("node");
    if (!nodePath) return null;
    const bin = path.dirname(nodePath);
    return {
      scope: "studio",
      toolchainId: this.id,
      displayName: `system: ${nodePath}`,
      root: bin,
      bin,
      envVars: {},
    };
  }

  detectProjectEnv(ctx: ProjectContext): ToolchainEnv | null {
    // Explicit override
    if (ctx.explicitPath && this.binaries_.firstExisting([ctx.explicitPath])) {
      const bin = path.dirname(ctx.explicitPath);
      return this.envFromBin(bin, `explicit: ${ctx.explicitPath}`);
    }

    // Version-manager resolution (nvm, fnm) against project hints.
    const hint = this.versionDetector.detect(ctx.projectRoot);
    const managed = hint ? this.resolveVersionManagerBin(hint) : null;
    if (managed) return this.envFromBin(managed.bin, managed.displayName);

    // project-local node_modules/.bin contributes npm-installed
    // executables — useful when callers ask for `jest`, `tsc`, etc.
    // The runtime `node` itself still falls back to the system binary.
    const nodeFromPath = this.binaries_.whichFromPath("node");
    if (!nodeFromPath) return null;
    const bin = path.dirname(nodeFromPath);
    const localBin = path.join(ctx.projectRoot, "node_modules", ".bin");
    const extraBins = fs.existsSync(localBin) ? [localBin] : [];
    return {
      scope: "project",
      toolchainId: this.id,
      displayName: `system (${nodeFromPath})`,
      root: bin,
      bin,
      envVars: {
        // node_modules/.bin prepended through the resolver's PATH
        // merger — encoded as a marker env var the service understands.
        BLACKSMITH_PROJECT_BIN: extraBins.join(this.platform.pathDelimiter),
      },
    };
  }

  resolveBinary(binary: string, env: ToolchainEnv): ResolvedBinary {
    const direct = path.join(env.bin, this.platform.shimName(binary));
    const resolved = this.binaries_.firstExisting([direct]);
    if (resolved) return { command: resolved, prependArgs: [] };
    return { command: binary, prependArgs: [] };
  }

  async checkAvailable(
    env: ToolchainEnv,
  ): Promise<{ ok: boolean; version?: string; error?: string }> {
    const node = this.resolveBinary("node", env);
    try {
      const out = execFileSync(node.command, ["--version"], {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 5000,
      }).trim();
      return { ok: true, version: out };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  /**
   * Enumerate Node runtimes installed on this machine so the UI can
   * offer a "Change interpreter" picker. Covers:
   *   · whichever `node` is on PATH
   *   · every version under `~/.nvm/versions/node/*`
   *   · every version under `~/.fnm/node-versions/*`
   *   · common system install locations (Homebrew, /usr/local, /usr)
   * Dedupes by resolved real path so symlinked installs surface once.
   */
  async listInstalledVersions(): Promise<InstalledVersion[]> {
    return detectNodeInstallations().map((install) => ({
      displayName: install.label,
      path: install.path,
      version: install.version,
      source: classifySource(install.label),
    }));
  }

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

  private envFromBin(bin: string, display: string): ToolchainEnv {
    return {
      scope: "project",
      toolchainId: this.id,
      displayName: display,
      root: path.dirname(bin),
      bin,
      envVars: {},
    };
  }

  /**
   * Resolve a `.nvmrc` / `engines.node` hint to an absolute bin directory
   * by walking the well-known nvm / fnm install layouts. Returns null
   * if no matching version is installed — the caller falls back to the
   * system Node.
   */
  private resolveVersionManagerBin(
    hint: NodeVersionHint,
  ): { bin: string; displayName: string } | null {
    const home = this.platform.homeDir();
    if (!home) return null;
    const wanted = hint.version.replace(/^v/, "");
    const nvmDir = process.env.NVM_DIR ?? path.join(home, ".nvm");
    const nvmVersions = path.join(nvmDir, "versions", "node");
    if (fs.existsSync(nvmVersions)) {
      const match = this.pickVersion(fs.readdirSync(nvmVersions), wanted);
      if (match) {
        return {
          bin: path.join(nvmVersions, match, "bin"),
          displayName: `nvm ${match}`,
        };
      }
    }
    const fnmVersions = path.join(home, ".fnm", "node-versions");
    if (fs.existsSync(fnmVersions)) {
      const match = this.pickVersion(fs.readdirSync(fnmVersions), wanted);
      if (match) {
        return {
          bin: path.join(fnmVersions, match, "installation", "bin"),
          displayName: `fnm ${match}`,
        };
      }
    }
    return null;
  }

  /**
   * Greedy match — walks the installed-versions list for the first
   * entry that starts with the wanted spec. Handles "v20" → v20.11.0
   * without pulling in a full semver parser.
   */
  private pickVersion(installed: string[], wanted: string): string | null {
    const normalized = wanted.replace(/^\^|^~/, "");
    const hit = installed.find(
      (v) => v === `v${normalized}` || v === normalized,
    );
    if (hit) return hit;
    const loose = installed.find((v) => v.replace(/^v/, "").startsWith(normalized));
    return loose ?? null;
  }
}

function classifySource(label: string): InstalledVersion["source"] {
  const lower = label.toLowerCase();
  if (lower.startsWith("default")) return "default";
  if (lower.startsWith("nvm")) return "nvm";
  if (lower.startsWith("fnm")) return "fnm";
  if (lower.startsWith("system") || lower.includes("homebrew")) return "system";
  return "other";
}

