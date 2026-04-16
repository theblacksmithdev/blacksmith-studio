import path from "node:path";
import os from "node:os";
import {
  detectPythonInstallations,
  MIN_PYTHON_VERSION,
  type PythonInstallation,
} from "./detect-python.js";
import { pythonEnv } from "./python-env.js";
import { PackageManager } from "./package-manager.js";

const VENV_DIR = path.join(os.homedir(), ".blacksmith-studio", "venv");

export interface PythonCheckResult {
  installed: boolean;
  version?: string;
  meetsMinimum: boolean;
  venvReady: boolean;
}

export interface PythonSetupResult {
  success: boolean;
  error?: string;
}

type ProgressCallback = (line: string) => void;

/**
 * Manages Python detection and the Studio venv lifecycle.
 * For package operations inside the venv, use `this.packages`.
 */
export class PythonManager {
  /** Package manager for the Studio venv. */
  readonly packages = new PackageManager();

  // ── Detection ──

  detectInstallations(): PythonInstallation[] {
    return detectPythonInstallations();
  }

  checkPython(pythonPath?: string): PythonCheckResult {
    const venvReady = this.isVenvReady();
    const bin = pythonPath || this.findSystemPython() || "python3";

    try {
      const { execSync } = require("node:child_process");
      const version = execSync(`"${bin}" --version 2>&1`, {
        timeout: 5000,
        encoding: "utf-8",
        shell: true,
        env: pythonEnv(pythonPath),
      })
        .trim()
        .replace(/^Python\s*/i, "");

      const parts = version.split(".").map(Number);
      const min = MIN_PYTHON_VERSION.split(".").map(Number);
      const meetsMinimum =
        parts[0] > min[0] ||
        (parts[0] === min[0] && parts[1] >= min[1]);

      return { installed: true, version, meetsMinimum, venvReady };
    } catch {
      return { installed: false, meetsMinimum: false, venvReady };
    }
  }

  // ── Venv Lifecycle ──

  isVenvReady(): boolean {
    return this.packages.ready;
  }

  getVenvDir(): string {
    return VENV_DIR;
  }

  getVenvPython(): string {
    return this.packages.python;
  }

  getVenvPip(): string {
    return this.packages.pip;
  }

  getVenvBin(cmd: string): string {
    return this.packages.bin(cmd);
  }

  async createVenv(
    pythonVersion?: string,
    onProgress?: ProgressCallback,
  ): Promise<PythonSetupResult> {
    return this.packages.createVenv(pythonVersion, onProgress);
  }

  resetVenv(): void {
    this.packages.resetVenv();
  }

  // ── Private ──

  private findSystemPython(): string | null {
    try {
      const { execSync } = require("node:child_process");
      return (
        execSync(
          "which python3 2>/dev/null || command -v python3 2>/dev/null",
          { encoding: "utf-8", timeout: 3000, shell: true },
        ).trim() || null
      );
    } catch {
      return null;
    }
  }

}
