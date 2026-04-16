import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import type { PythonManager } from "../../server/services/python/index.js";
import type { SettingsManager } from "../../server/services/settings.js";
import {
  PYTHON_DETECT,
  PYTHON_CHECK,
  PYTHON_SETUP_VENV,
  PYTHON_RESET_VENV,
  PYTHON_INSTALL_PACKAGE,
  PYTHON_IS_PACKAGE_INSTALLED,
  PYTHON_ON_PROGRESS,
} from "./channels.js";

export function setupPythonIPC(
  getWindow: () => BrowserWindow | null,
  pythonManager: PythonManager,
  settingsManager: SettingsManager,
) {
  ipcMain.handle(PYTHON_DETECT, () => {
    return pythonManager.detectInstallations();
  });

  ipcMain.handle(PYTHON_CHECK, (_e, data?: { projectId?: string }) => {
    const pythonPath = data?.projectId
      ? (settingsManager.resolve(data.projectId, "python.pythonPath") as
          | string
          | undefined) || undefined
      : undefined;
    return pythonManager.checkPython(pythonPath);
  });

  ipcMain.handle(
    PYTHON_SETUP_VENV,
    async (_e, data?: { projectId?: string }) => {
      const pythonPath = data?.projectId
        ? (settingsManager.resolve(data.projectId, "python.pythonPath") as
            | string
            | undefined) || undefined
        : undefined;
      const win = getWindow();
      return pythonManager.createVenv(pythonPath, (line) => {
        win?.webContents.send(PYTHON_ON_PROGRESS, { line });
      });
    },
  );

  ipcMain.handle(PYTHON_RESET_VENV, () => {
    pythonManager.resetVenv();
  });

  ipcMain.handle(
    PYTHON_INSTALL_PACKAGE,
    async (_e, data: { pkg: string }) => {
      const win = getWindow();
      return pythonManager.packages.install(data.pkg, (line) => {
        win?.webContents.send(PYTHON_ON_PROGRESS, { line });
      });
    },
  );

  ipcMain.handle(
    PYTHON_IS_PACKAGE_INSTALLED,
    async (_e, data: { pkg: string }) => {
      return pythonManager.packages.isInstalled(data.pkg);
    },
  );
}
