import { ipcMain, type BrowserWindow } from "electron";
import type {
  CommandResult,
  CommandService,
  CommandSpec,
  CommandStatusChange,
  CommandOutputChunk,
} from "../../server/services/commands/index.js";
import { CommandError } from "../../server/services/commands/index.js";
import {
  COMMANDS_RUN,
  COMMANDS_STREAM_START,
  COMMANDS_CANCEL,
  COMMANDS_CHECK_AVAILABLE,
  COMMANDS_RESOLVE_ENV,
  COMMANDS_LIST_TOOLCHAINS,
  COMMANDS_LIST_INSTALLED_VERSIONS,
  COMMANDS_LIST_RUNS,
  COMMANDS_GET_RUN,
  COMMANDS_CREATE_ENV,
  COMMANDS_DELETE_ENV,
  COMMANDS_ON_OUTPUT,
  COMMANDS_ON_STATUS,
} from "./channels.js";

interface IpcErrorShape {
  error: { code: string; message: string; hint?: string };
}

/**
 * IPC handlers for the CommandService.
 *
 * Read / mutate methods route to the service. The two push channels
 * are wired once via `service.onChunk` / `service.onStatus` so every
 * spawned command streams output back to the renderer without per-call
 * wiring.
 *
 * Typed `CommandError`s are translated into a structured `{ error }`
 * shape rather than thrown so the renderer receives the `code` and
 * `hint` it needs to render a useful message.
 */
export function setupCommandsIPC(
  getWindow: () => BrowserWindow | null,
  commandService: CommandService,
): void {
  ipcMain.handle(
    COMMANDS_RUN,
    async (_e, spec: CommandSpec): Promise<CommandResult | IpcErrorShape> => {
      try {
        return await commandService.run(spec);
      } catch (err) {
        return asError(err);
      }
    },
  );

  ipcMain.handle(
    COMMANDS_STREAM_START,
    (_e, spec: CommandSpec): { runId: string } | IpcErrorShape => {
      try {
        const handle = commandService.stream(spec);
        // Swallow rejection — callers consume results via push streams.
        handle.promise.catch(() => undefined);
        return { runId: handle.runId };
      } catch (err) {
        return asError(err);
      }
    },
  );

  ipcMain.handle(
    COMMANDS_CANCEL,
    (_e, data: { runId: string }): { ok: boolean } =>
      ({ ok: commandService.cancel(data.runId) }),
  );

  ipcMain.handle(
    COMMANDS_CHECK_AVAILABLE,
    (
      _e,
      data: { projectId: string; toolchainId: string; scope: "studio" | "project" },
    ) => commandService.checkAvailable(data),
  );

  ipcMain.handle(
    COMMANDS_RESOLVE_ENV,
    (
      _e,
      data: { projectId: string; toolchainId: string; scope: "studio" | "project" },
    ) => commandService.resolveEnv(data),
  );

  ipcMain.handle(COMMANDS_LIST_TOOLCHAINS, () =>
    commandService.listToolchains(),
  );

  ipcMain.handle(
    COMMANDS_LIST_INSTALLED_VERSIONS,
    (_e, data: { toolchainId: string }) =>
      commandService.listInstalledVersions(data.toolchainId),
  );

  ipcMain.handle(
    COMMANDS_LIST_RUNS,
    (
      _e,
      data: { projectId: string; conversationId?: string; limit?: number },
    ) =>
      commandService.listRuns(
        data.projectId,
        data.conversationId,
        data.limit,
      ),
  );

  ipcMain.handle(COMMANDS_GET_RUN, (_e, data: { runId: string }) =>
    commandService.getRun(data.runId),
  );

  ipcMain.handle(
    COMMANDS_CREATE_ENV,
    async (
      _e,
      data: {
        projectId?: string;
        toolchainId: string;
        scope: "project" | "studio";
        options?: Record<string, unknown>;
      },
    ) => {
      try {
        return await commandService.createEnv(data);
      } catch (err) {
        return asError(err);
      }
    },
  );

  ipcMain.handle(
    COMMANDS_DELETE_ENV,
    async (
      _e,
      data: {
        projectId?: string;
        toolchainId: string;
        scope: "project" | "studio";
      },
    ): Promise<{ ok: true } | IpcErrorShape> => {
      try {
        await commandService.deleteEnv(data);
        return { ok: true };
      } catch (err) {
        return asError(err);
      }
    },
  );

  commandService.onChunk((chunk: CommandOutputChunk) => {
    getWindow()?.webContents.send(COMMANDS_ON_OUTPUT, chunk);
  });
  commandService.onStatus((status: CommandStatusChange) => {
    getWindow()?.webContents.send(COMMANDS_ON_STATUS, status);
  });
}

function asError(err: unknown): IpcErrorShape {
  if (err instanceof CommandError) {
    return {
      error: { code: err.code, message: err.message, hint: err.hint },
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { error: { code: "UNKNOWN", message } };
}
