import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import type { PythonManager } from "../../server/services/python/index.js";
import {
  PYTHON_INSTALL_PACKAGE,
  PYTHON_IS_PACKAGE_INSTALLED,
  PYTHON_ON_PROGRESS,
} from "./channels.js";

/**
 * Low-level package ops against the Studio venv (used by Graphify's
 * installer). Venv lifecycle (create / reset / detect) has moved to
 * the commands subsystem — see `CommandService.createEnv/deleteEnv`
 * with `scope: "studio"`.
 */
export function setupPythonIPC(
  getWindow: () => BrowserWindow | null,
  pythonManager: PythonManager,
) {
  ipcMain.handle(PYTHON_INSTALL_PACKAGE, async (_e, data: { pkg: string }) => {
    const win = getWindow();
    return pythonManager.packages.install(data.pkg, (line) => {
      win?.webContents.send(PYTHON_ON_PROGRESS, { line });
    });
  });

  ipcMain.handle(
    PYTHON_IS_PACKAGE_INSTALLED,
    async (_e, data: { pkg: string }) => {
      return pythonManager.packages.isInstalled(data.pkg);
    },
  );
}
