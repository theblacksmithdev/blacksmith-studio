import { ipcMain, type BrowserWindow } from "electron";
import type {
  UsageService,
  UsageScope,
  HistoryScope,
} from "../../server/services/usage/index.js";
import {
  USAGE_GET_SESSION_METER,
  USAGE_GET_HISTORY,
  USAGE_GET_SCOPE_DETAIL,
  USAGE_ON_UPDATE,
} from "./channels.js";

/**
 * IPC surface for the usage subsystem. The handler only routes requests —
 * aggregation logic lives in UsageService.
 *
 * Returns a notifier the rest of the backend calls to push live updates
 * to the renderer (e.g. after an assistant turn writes tokens).
 */
export function setupUsageIPC(
  getWindow: () => BrowserWindow | null,
  usageService: UsageService,
) {
  ipcMain.handle(
    USAGE_GET_SESSION_METER,
    (_e, data: { scope: UsageScope; scopeId: string }) => {
      return usageService.getSessionMeter(data.scope, data.scopeId);
    },
  );

  ipcMain.handle(USAGE_GET_HISTORY, (_e, data: { projectId: string }) => {
    return usageService.getHistory(data.projectId);
  });

  ipcMain.handle(
    USAGE_GET_SCOPE_DETAIL,
    (_e, data: { scope: HistoryScope; scopeId: string }) => {
      return usageService.getScopeDetail(data.scope, data.scopeId);
    },
  );

  return {
    /** Push a fresh meter snapshot to the renderer. Called after a turn persists. */
    notifyUpdate(scope: UsageScope, scopeId: string): void {
      const meter = usageService.getSessionMeter(scope, scopeId);
      getWindow()?.webContents.send(USAGE_ON_UPDATE, meter);
    },
  };
}

export type UsageIPC = ReturnType<typeof setupUsageIPC>;
