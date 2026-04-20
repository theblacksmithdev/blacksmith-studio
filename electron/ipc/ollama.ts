import { ipcMain, type BrowserWindow } from "electron";
import type { OllamaManager } from "../../server/services/ollama/index.js";
import {
  OLLAMA_STATE,
  OLLAMA_INSTALL,
  OLLAMA_START_DAEMON,
  OLLAMA_STOP_DAEMON,
  OLLAMA_LIST_MODELS,
  OLLAMA_PULL_MODEL,
  OLLAMA_CANCEL_PULL,
  OLLAMA_DELETE_MODEL,
  OLLAMA_ON_INSTALL_PROGRESS,
  OLLAMA_ON_DAEMON_STATUS,
  OLLAMA_ON_PULL_PROGRESS,
} from "./channels.js";

/**
 * IPC bridge to the Ollama subsystem.
 *
 * Invoke channels are RPC — install, start/stop daemon, list/pull/
 * delete models. Subscribe channels push state changes to the UI so
 * the settings screen can show live install/pull progress and the
 * daemon status chip.
 *
 * An in-flight pull is tracked by an abort controller keyed on the
 * model name so the UI can cancel it.
 */
export function setupOllamaIPC(
  getWindow: () => BrowserWindow | null,
  ollama: OllamaManager,
) {
  const inFlightPulls = new Map<string, AbortController>();

  // Push daemon status changes — fired once per `daemon.setStatus`.
  ollama.onDaemonStatus((change) => {
    getWindow()?.webContents.send(OLLAMA_ON_DAEMON_STATUS, change);
  });

  ipcMain.handle(OLLAMA_STATE, () => ollama.state());

  ipcMain.handle(OLLAMA_INSTALL, async () => {
    await ollama.install((p) => {
      getWindow()?.webContents.send(OLLAMA_ON_INSTALL_PROGRESS, p);
    });
    return { ok: true };
  });

  ipcMain.handle(OLLAMA_START_DAEMON, async () => {
    await ollama.ensureRunning();
    return { ok: true };
  });

  ipcMain.handle(OLLAMA_STOP_DAEMON, async () => {
    ollama.daemon.stop();
    return { ok: true };
  });

  ipcMain.handle(OLLAMA_LIST_MODELS, () => ollama.listModels());

  ipcMain.handle(OLLAMA_PULL_MODEL, async (_e, data: { name: string }) => {
    const existing = inFlightPulls.get(data.name);
    if (existing) existing.abort();
    const controller = new AbortController();
    inFlightPulls.set(data.name, controller);
    try {
      await ollama.pullModel(
        data.name,
        (progress) => {
          getWindow()?.webContents.send(OLLAMA_ON_PULL_PROGRESS, progress);
        },
        controller.signal,
      );
      return { ok: true };
    } finally {
      inFlightPulls.delete(data.name);
    }
  });

  ipcMain.handle(OLLAMA_CANCEL_PULL, async (_e, data: { name: string }) => {
    const controller = inFlightPulls.get(data.name);
    if (controller) controller.abort();
    return { ok: true };
  });

  ipcMain.handle(OLLAMA_DELETE_MODEL, (_e, data: { name: string }) =>
    ollama.deleteModel(data.name),
  );
}
