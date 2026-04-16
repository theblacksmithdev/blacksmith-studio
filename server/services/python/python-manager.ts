import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn, execFile } from "node:child_process";
import {
  detectPythonInstallations,
  MIN_PYTHON_VERSION,
  type PythonInstallation,
} from "./detect-python.js";
import { pythonEnv, pythonCmd } from "./python-env.js";

const VENV_DIR = path.join(os.homedir(), ".blacksmith-studio", "venv");
const IS_WIN = process.platform === "win32";
const BIN_DIR = IS_WIN ? "Scripts" : "bin";

export interface PythonCheckResult {
  installed: boolean;
  version?: string;
  meetsMinimum: boolean;
}

export interface PythonSetupResult {
  success: boolean;
  error?: string;
}

type ProgressCallback = (line: string) => void;

export class PythonManager {
  /** Detect all Python installations on the system. */
  detectInstallations(): PythonInstallation[] {
    return detectPythonInstallations();
  }

  /** Check if a specific Python binary is available and meets minimum version. */
  checkPython(pythonPath?: string): PythonCheckResult {
    const bin = pythonPath || "python3";
    try {
      const { execSync } = require("node:child_process");
      const version = execSync(`"${bin}" --version`, {
        timeout: 5000,
        encoding: "utf-8",
        env: pythonEnv(pythonPath),
      })
        .trim()
        .replace(/^Python\s*/i, "");

      const parts = version.split(".").map(Number);
      const min = MIN_PYTHON_VERSION.split(".").map(Number);
      const meetsMinimum =
        parts[0] > min[0] ||
        (parts[0] === min[0] && parts[1] >= min[1]);

      return { installed: true, version, meetsMinimum };
    } catch {
      return { installed: false, meetsMinimum: false };
    }
  }

  // ── Venv Lifecycle ──

  /** Check if the Studio venv exists and has a working python. */
  isVenvReady(): boolean {
    return fs.existsSync(this.getVenvPython());
  }

  /** Get the venv directory path. */
  getVenvDir(): string {
    return VENV_DIR;
  }

  /** Get the path to python inside the venv. */
  getVenvPython(): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? "python.exe" : "python3");
  }

  /** Get the path to pip inside the venv. */
  getVenvPip(): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? "pip.exe" : "pip3");
  }

  /** Get the path to any binary installed in the venv. */
  getVenvBin(cmd: string): string {
    return path.join(VENV_DIR, BIN_DIR, IS_WIN ? `${cmd}.exe` : cmd);
  }

  /** Create the Studio venv using the given (or default) Python binary. */
  async createVenv(
    pythonPath?: string,
    onProgress?: ProgressCallback,
  ): Promise<PythonSetupResult> {
    const bin = pythonPath || "python3";

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(VENV_DIR), { recursive: true });

    onProgress?.(`Creating venv at ${VENV_DIR}...`);

    const result = await this.spawnAndCollect(
      bin,
      ["-m", "venv", VENV_DIR],
      onProgress,
      pythonEnv(pythonPath),
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error ?? "Failed to create venv",
      };
    }

    // Upgrade pip inside the venv
    onProgress?.("Upgrading pip...");
    await this.spawnAndCollect(
      this.getVenvPip(),
      ["install", "--upgrade", "pip"],
      onProgress,
    );

    onProgress?.("Venv ready.");
    return { success: true };
  }

  /** Remove the Studio venv entirely. */
  resetVenv(): void {
    if (fs.existsSync(VENV_DIR)) {
      fs.rmSync(VENV_DIR, { recursive: true, force: true });
    }
  }

  // ── Package Management ──

  /** Install a package into the Studio venv. */
  async installPackage(
    pkg: string,
    onProgress?: ProgressCallback,
  ): Promise<PythonSetupResult> {
    if (!this.isVenvReady()) {
      return {
        success: false,
        error: "Studio venv not found. Create it first.",
      };
    }

    onProgress?.(`Installing ${pkg}...`);
    return this.spawnAndCollect(
      this.getVenvPip(),
      ["install", pkg],
      onProgress,
    );
  }

  /** Check if a package is installed in the Studio venv. */
  async isPackageInstalled(pkg: string): Promise<boolean> {
    if (!this.isVenvReady()) return false;

    return new Promise((resolve) => {
      execFile(
        this.getVenvPip(),
        ["show", pkg],
        { timeout: 10_000 },
        (err) => {
          resolve(!err);
        },
      );
    });
  }

  // ── Private ──

  private spawnAndCollect(
    cmd: string,
    args: string[],
    onProgress?: ProgressCallback,
    env?: Record<string, string | undefined>,
  ): Promise<PythonSetupResult> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        stdio: ["ignore", "pipe", "pipe"],
        env: env ?? process.env,
        timeout: 300_000,
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
