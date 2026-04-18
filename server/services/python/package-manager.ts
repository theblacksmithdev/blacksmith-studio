import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn, type ChildProcess } from "node:child_process";
import { createRequire } from "node:module";
import { platform } from "../platform/index.js";

const VENV_DIR = path.join(os.homedir(), ".blacksmith-studio", "venv");
const IS_WIN = platform.isWindows;
const BIN_DIR = platform.venvBinDir;

export interface PackageResult {
  success: boolean;
  error?: string;
}

export interface PackageInfo {
  name: string;
  version: string;
}

export type ProgressCallback = (line: string) => void;

/**
 * Manages Python packages within the Studio venv using `uv` (bundled via npm).
 *
 * uv is an extremely fast Python package manager written in Rust.
 * It's distributed as an npm package (@manzt/uv) so no Python is needed to bootstrap.
 *
 * All pip operations target ~/.blacksmith-studio/venv/ via --python flag.
 */
export class PackageManager {
  private _uvBin: string | null = null;

  // ── uv Binary Resolution ──

  /** Resolve the bundled uv binary path from node_modules. */
  private get uv(): string {
    if (this._uvBin) return this._uvBin;

    // Resolve from the @manzt/uv npm package
    try {
      const req = createRequire(import.meta.url);
      const uvPkg = path.dirname(req.resolve("@manzt/uv/package.json"));
      const bin = path.join(uvPkg, IS_WIN ? "uv.exe" : "uv");
      if (fs.existsSync(bin)) {
        this._uvBin = bin;
        return bin;
      }
    } catch {
      /* package not resolved */
    }

    // Fallback: try system uv
    this._uvBin = "uv";
    return "uv";
  }

  // ── Path Helpers ──

  /** Path to python in the venv. */
  get python(): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? "python.exe" : "python3");
  }

  /** Path to pip in the venv. */
  get pip(): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? "pip.exe" : "pip3");
  }

  /** Path to any CLI binary installed in the venv. */
  bin(cmd: string): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? `${cmd}.exe` : cmd);
  }

  /** Whether the venv exists and has a working python. */
  get ready(): boolean {
    return fs.existsSync(this.python);
  }

  /** The venv directory path. */
  get venvDir(): string {
    return VENV_DIR;
  }

  // ── Venv Lifecycle ──

  /** Create the Studio venv. Uses uv which can bootstrap Python if needed. */
  async createVenv(
    pythonVersion?: string,
    onProgress?: ProgressCallback,
  ): Promise<PackageResult> {
    fs.mkdirSync(path.dirname(VENV_DIR), { recursive: true });
    onProgress?.(`Creating venv at ${VENV_DIR}...`);

    const args = ["venv", VENV_DIR];
    if (pythonVersion) args.push("--python", pythonVersion);

    return this.exec(args, onProgress);
  }

  /** Remove the Studio venv entirely. */
  resetVenv(): void {
    if (fs.existsSync(VENV_DIR)) {
      fs.rmSync(VENV_DIR, { recursive: true, force: true });
    }
    this._uvBin = null;
  }

  // ── Install / Uninstall ──

  /** Install a package into the venv. */
  async install(
    pkg: string,
    onProgress?: ProgressCallback,
  ): Promise<PackageResult> {
    this.ensureReady();
    onProgress?.(`Installing ${pkg}...`);
    return this.exec(
      ["pip", "install", pkg, "--python", this.python],
      onProgress,
    );
  }

  /** Upgrade a package in the venv. */
  async upgrade(
    pkg: string,
    onProgress?: ProgressCallback,
  ): Promise<PackageResult> {
    this.ensureReady();
    onProgress?.(`Upgrading ${pkg}...`);
    return this.exec(
      ["pip", "install", "--upgrade", pkg, "--python", this.python],
      onProgress,
    );
  }

  /** Uninstall a package from the venv. */
  async uninstall(
    pkg: string,
    onProgress?: ProgressCallback,
  ): Promise<PackageResult> {
    this.ensureReady();
    onProgress?.(`Uninstalling ${pkg}...`);
    return this.exec(
      ["pip", "uninstall", "-y", pkg, "--python", this.python],
      onProgress,
    );
  }

  // ── Query ──

  /** Check if a package is installed. */
  async isInstalled(pkg: string): Promise<boolean> {
    if (!this.ready) return false;
    const result = await this.exec([
      "pip",
      "show",
      pkg,
      "--python",
      this.python,
    ]);
    return result.success;
  }

  /** Get info about an installed package. Returns null if not installed. */
  async getInfo(pkg: string): Promise<PackageInfo | null> {
    if (!this.ready) return null;
    const output = await this.execForOutput([
      "pip",
      "show",
      pkg,
      "--python",
      this.python,
    ]);
    if (!output) return null;

    const name = output.match(/^Name:\s*(.+)/m)?.[1]?.trim() ?? pkg;
    const version = output.match(/^Version:\s*(.+)/m)?.[1]?.trim() ?? "unknown";
    return { name, version };
  }

  /** Get the installed version of a package. Returns null if not installed. */
  async getVersion(pkg: string): Promise<string | null> {
    const info = await this.getInfo(pkg);
    return info?.version ?? null;
  }

  /** List all installed packages. */
  async list(): Promise<PackageInfo[]> {
    if (!this.ready) return [];
    const output = await this.execForOutput([
      "pip",
      "list",
      "--format",
      "json",
      "--python",
      this.python,
    ]);
    if (!output) return [];
    try {
      return JSON.parse(output) as PackageInfo[];
    } catch {
      return [];
    }
  }

  // ── Run ──

  /** Run a venv binary and return its stdout. Returns null on failure. */
  async run(
    cmd: string,
    args: string[],
    opts?: { cwd?: string; timeout?: number },
  ): Promise<string | null> {
    const binPath = this.bin(cmd);
    const target = fs.existsSync(binPath) ? binPath : cmd;
    return this.execRaw(target, args, opts?.cwd, opts?.timeout);
  }

  /** Run a venv binary with streaming progress. */
  async runWithProgress(
    cmd: string,
    args: string[],
    onProgress?: ProgressCallback,
    opts?: { cwd?: string; timeout?: number },
  ): Promise<PackageResult> {
    const binPath = this.bin(cmd);
    const target = fs.existsSync(binPath) ? binPath : cmd;
    return this.execRawWithProgress(
      target,
      args,
      onProgress,
      opts?.cwd,
      opts?.timeout,
    );
  }

  /** Spawn a venv binary and return the raw ChildProcess. */
  spawn(
    cmd: string,
    args: string[],
    opts?: { cwd?: string; timeout?: number },
  ): ChildProcess {
    const binPath = this.bin(cmd);
    const target = fs.existsSync(binPath) ? binPath : cmd;
    return spawn(target, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      cwd: opts?.cwd,
      timeout: opts?.timeout ?? 300_000,
    });
  }

  /** Run a Python expression in the venv. Returns stdout or null. */
  async pythonExec(code: string): Promise<string | null> {
    if (!this.ready) return null;
    return this.execRaw(this.python, ["-c", code]);
  }

  /** Check if a Python module is importable in the venv. */
  async isModuleImportable(module: string): Promise<boolean> {
    const result = await this.pythonExec(`import ${module}; print('ok')`);
    return result === "ok";
  }

  /** Get a module's __version__ from the venv. Returns null if not importable. */
  async getModuleVersion(module: string): Promise<string | null> {
    const result = await this.pythonExec(
      `import ${module}; print(getattr(${module}, '__version__', 'unknown'))`,
    );
    return result && result !== "unknown" ? result : null;
  }

  /** Get uv's own version. */
  async getUvVersion(): Promise<string | null> {
    return this.execForOutput(["--version"]);
  }

  // ── Private: uv execution ──

  private ensureReady(): void {
    if (!this.ready) {
      throw new Error(
        "Studio Python environment not found. Create it in Settings → Workspace → Studio Environment.",
      );
    }
  }

  /** Execute a uv command and return success/error. */
  private exec(
    args: string[],
    onProgress?: ProgressCallback,
    cwd?: string,
    timeout = 300_000,
  ): Promise<PackageResult> {
    return new Promise((resolve) => {
      const proc = spawn(this.uv, args, {
        stdio: ["ignore", "pipe", "pipe"],
        cwd,
        timeout,
      });

      let stderr = "";

      proc.stdout?.on("data", (data: Buffer) => {
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.on("close", (code) => {
        if (code === 0) resolve({ success: true });
        else
          resolve({
            success: false,
            error: stderr.trim().slice(0, 500) || `Exit code ${code}`,
          });
      });

      proc.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  /** Execute a uv command and return stdout. */
  private execForOutput(
    args: string[],
    cwd?: string,
    timeout = 10_000,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const proc = spawn(this.uv, args, {
        stdio: ["ignore", "pipe", "pipe"],
        cwd,
        timeout,
      });

      let stdout = "";
      proc.stdout?.on("data", (d: Buffer) => {
        stdout += d.toString();
      });

      proc.on("close", (code) => {
        resolve(code === 0 && stdout.trim() ? stdout.trim() : null);
      });

      proc.on("error", () => resolve(null));
    });
  }

  /** Execute a raw command (not uv) and return stdout. */
  private execRaw(
    cmd: string,
    args: string[],
    cwd?: string,
    timeout = 10_000,
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        cwd,
        timeout,
      });

      let stdout = "";
      proc.stdout?.on("data", (d: Buffer) => {
        stdout += d.toString();
      });

      proc.on("close", (code) => {
        resolve(code === 0 && stdout.trim() ? stdout.trim() : null);
      });

      proc.on("error", () => resolve(null));
    });
  }

  /** Execute a raw command with progress streaming. */
  private execRawWithProgress(
    cmd: string,
    args: string[],
    onProgress?: ProgressCallback,
    cwd?: string,
    timeout = 300_000,
  ): Promise<PackageResult> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        cwd,
        timeout,
      });

      let stderr = "";

      proc.stdout?.on("data", (data: Buffer) => {
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.stderr?.on("data", (data: Buffer) => {
        stderr += data.toString();
        for (const line of data.toString().split("\n").filter(Boolean)) {
          onProgress?.(line);
        }
      });

      proc.on("close", (code) => {
        if (code === 0) resolve({ success: true });
        else
          resolve({
            success: false,
            error: stderr.trim().slice(0, 500) || `Exit code ${code}`,
          });
      });

      proc.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }
}
