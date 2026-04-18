import path from "node:path";
import os from "node:os";
import { PackageManager } from "./package-manager.js";

const DEFAULT_VENV_DIR = path.join(
  os.homedir(),
  ".blacksmith-studio",
  "venv",
);

/**
 * Thin holder for the Studio-venv `PackageManager`. Retained so
 * Graphify can keep calling `python.packages.run / install / …`
 * without needing to know about `CommandService` composition.
 *
 * Venv lifecycle (create / reset / detect) moved to the commands
 * subsystem — callers that need to bootstrap the studio venv should
 * go through `CommandService.createEnv({ scope: 'studio', … })`.
 * Python detection moved to `PythonToolchain.listInstalledVersions()`.
 */
export class PythonManager {
  /** Package manager for the Studio venv. */
  readonly packages: PackageManager;

  constructor(venvDir: string = DEFAULT_VENV_DIR) {
    this.packages = new PackageManager(venvDir);
  }
}
