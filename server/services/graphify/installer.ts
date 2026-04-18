import fs from "node:fs";
import type { PythonManager } from "../python/index.js";
import { BIN_NAME, PKG_NAME } from "./constants.js";
import type {
  GraphifyInstallCheck,
  GraphifySetupResult,
  ProgressCallback,
} from "./types.js";

/** Injected env-lifecycle hook. Kept narrow so Installer depends only
 *  on the verb it needs, not the full CommandService surface. */
export type StudioEnvCreator = (options: {
  python?: string;
}) => Promise<void>;

/**
 * Install and detect the `graphify` CLI inside the Studio Python venv.
 *
 * Single Responsibility: package lifecycle. Owns nothing about graphs or
 * build output — just whether the tool is present and how to put it there.
 */
export class Installer {
  constructor(
    private readonly python: PythonManager,
    private readonly createStudioEnv: StudioEnvCreator,
  ) {}

  private get pkg() {
    return this.python.packages;
  }

  async check(): Promise<GraphifyInstallCheck> {
    if (fs.existsSync(this.pkg.bin(BIN_NAME))) {
      const version = await this.pkg.getVersion(PKG_NAME);
      return { installed: true, version: version ?? undefined };
    }

    if (this.pkg.ready) {
      const version = await this.pkg.getVersion(PKG_NAME);
      if (version) return { installed: true, version };
    }

    return { installed: false };
  }

  isInstalled(): boolean {
    return fs.existsSync(this.pkg.bin(BIN_NAME));
  }

  async setup(
    pythonVersion?: string,
    onProgress?: ProgressCallback,
  ): Promise<GraphifySetupResult> {
    if (!this.pkg.ready) {
      onProgress?.("Creating Studio Python environment...");
      try {
        await this.createStudioEnv({ python: pythonVersion });
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    onProgress?.("Installing graphifyy...");
    const install = await this.pkg.install(PKG_NAME, onProgress);
    if (!install.success) return install;

    const check = await this.check();
    if (!check.installed) {
      return { success: false, error: "Package installed but not detected." };
    }

    onProgress?.(`Setup complete. Graphify ${check.version ?? ""} ready.`);
    return { success: true };
  }
}
