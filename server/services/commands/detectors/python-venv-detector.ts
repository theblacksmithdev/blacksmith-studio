import fs from "node:fs";
import path from "node:path";
import { PlatformInfo } from "../../platform/index.js";
import { projectDataDir } from "../../project-paths.js";

export interface PythonEnvDetection {
  kind: "venv" | "poetry" | "pipenv" | "conda" | "pyenv";
  displayName: string;
  root: string;
  bin: string;
  pythonPath: string;
  /** Wrapper-based envs (Poetry, Pipenv) expose an invoker. */
  invoker?: { command: string; args: string[] };
}

/**
 * Ordered chain of Python project-env detection strategies.
 *
 * Single Responsibility: decide which Python environment a given
 * project root resolves to. Produces a uniform `PythonEnvDetection`
 * shape so `PythonToolchain` stays thin. Order matters — the first
 * strategy that matches wins, which lets users force a specific
 * interpretation simply by creating its marker file.
 */
export class PythonVenvDetector {
  constructor(private readonly platform: PlatformInfo) {}

  detect(projectRoot: string): PythonEnvDetection | null {
    return (
      // Blacksmith-owned venv lives inside `.blacksmith/` so it stays
      // out of the project root. Checked first — when present it
      // wins over a legacy root-level `.venv` / `venv`.
      this.tryBlacksmithVenv(projectRoot) ??
      this.tryLocalVenv(projectRoot, ".venv") ??
      this.tryLocalVenv(projectRoot, "venv") ??
      this.tryPoetry(projectRoot) ??
      this.tryPipenv(projectRoot) ??
      this.tryConda(projectRoot) ??
      this.tryPyenvVersion(projectRoot) ??
      null
    );
  }

  private tryBlacksmithVenv(
    projectRoot: string,
  ): PythonEnvDetection | null {
    const root = projectDataDir(projectRoot, ".venv");
    const bin = path.join(root, this.platform.venvBinDir);
    const pythonPath = path.join(bin, this.platform.binaryName("python"));
    if (!fs.existsSync(pythonPath)) return null;
    return {
      kind: "venv",
      displayName: ".blacksmith/.venv (Python)",
      root,
      bin,
      pythonPath,
    };
  }

  private tryLocalVenv(
    projectRoot: string,
    folder: string,
  ): PythonEnvDetection | null {
    const root = path.join(projectRoot, folder);
    const bin = path.join(root, this.platform.venvBinDir);
    const pythonPath = path.join(bin, this.platform.binaryName("python"));
    if (!fs.existsSync(pythonPath)) return null;
    return {
      kind: "venv",
      displayName: `${folder} (Python)`,
      root,
      bin,
      pythonPath,
    };
  }

  private tryPoetry(projectRoot: string): PythonEnvDetection | null {
    const pyproject = path.join(projectRoot, "pyproject.toml");
    if (!fs.existsSync(pyproject)) return null;
    const content = safeReadFile(pyproject);
    if (!content.includes("[tool.poetry]")) return null;
    return {
      kind: "poetry",
      displayName: "Poetry",
      root: projectRoot,
      bin: projectRoot,
      pythonPath: "poetry",
      invoker: { command: "poetry", args: ["run"] },
    };
  }

  private tryPipenv(projectRoot: string): PythonEnvDetection | null {
    if (!fs.existsSync(path.join(projectRoot, "Pipfile"))) return null;
    return {
      kind: "pipenv",
      displayName: "Pipenv",
      root: projectRoot,
      bin: projectRoot,
      pythonPath: "pipenv",
      invoker: { command: "pipenv", args: ["run"] },
    };
  }

  private tryConda(projectRoot: string): PythonEnvDetection | null {
    const envFile = path.join(projectRoot, "environment.yml");
    if (!fs.existsSync(envFile)) return null;
    const content = safeReadFile(envFile);
    const match = content.match(/^name:\s*(\S+)/m);
    const envName = match?.[1] ?? "";
    if (!envName) return null;
    return {
      kind: "conda",
      displayName: `conda: ${envName}`,
      root: projectRoot,
      bin: projectRoot,
      pythonPath: "conda",
      invoker: { command: "conda", args: ["run", "-n", envName, "--live-stream"] },
    };
  }

  private tryPyenvVersion(projectRoot: string): PythonEnvDetection | null {
    const versionFile = path.join(projectRoot, ".python-version");
    if (!fs.existsSync(versionFile)) return null;
    const version = safeReadFile(versionFile).trim();
    if (!version) return null;
    // We emit a marker — PythonToolchain will resolve against pyenv
    // installations it already knows about. If pyenv isn't installed
    // the caller falls through to the next strategy.
    return {
      kind: "pyenv",
      displayName: `pyenv ${version}`,
      root: projectRoot,
      bin: projectRoot,
      pythonPath: `pyenv-${version}`,
      invoker: { command: "pyenv", args: ["exec"] },
    };
  }
}

function safeReadFile(p: string): string {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return "";
  }
}
