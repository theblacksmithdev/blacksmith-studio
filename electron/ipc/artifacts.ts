import { ipcMain, type BrowserWindow } from "electron";
import type {
  ArtifactService,
  ArtifactCreateInput,
  ArtifactListInput,
} from "../../server/services/artifacts/index.js";
import {
  ARTIFACTS_LIST,
  ARTIFACTS_GET,
  ARTIFACTS_READ_CONTENT,
  ARTIFACTS_WRITE_CONTENT,
  ARTIFACTS_RENAME,
  ARTIFACTS_DELETE,
  ARTIFACTS_SET_TAGS,
  ARTIFACTS_CREATE,
  ARTIFACTS_BACKFILL,
  ARTIFACTS_ON_CHANGED,
} from "./channels.js";

/**
 * IPC handlers for artifact management.
 *
 * Reads go straight through the service. The on-changed push stream is
 * wired once via `artifactService.onChange(...)` so every mutation
 * (including agent writes during dispatch) reaches the renderer without
 * per-call-site plumbing.
 */
export function setupArtifactsIPC(
  getWindow: () => BrowserWindow | null,
  artifactService: ArtifactService,
): void {
  ipcMain.handle(ARTIFACTS_LIST, (_e, data: ArtifactListInput) =>
    artifactService.list(data),
  );

  ipcMain.handle(ARTIFACTS_GET, (_e, data: { id: string }) =>
    artifactService.get(data.id),
  );

  ipcMain.handle(ARTIFACTS_READ_CONTENT, (_e, data: { id: string }) =>
    artifactService.readContent(data.id),
  );

  ipcMain.handle(
    ARTIFACTS_WRITE_CONTENT,
    (_e, data: { id: string; content: string }) =>
      artifactService.writeContent(data.id, data.content),
  );

  ipcMain.handle(
    ARTIFACTS_RENAME,
    (_e, data: { id: string; title: string }) =>
      artifactService.rename(data.id, data.title),
  );

  ipcMain.handle(ARTIFACTS_DELETE, (_e, data: { id: string }) => {
    artifactService.delete(data.id);
    return { ok: true };
  });

  ipcMain.handle(
    ARTIFACTS_SET_TAGS,
    (_e, data: { id: string; tags: string[] }) =>
      artifactService.setTags(data.id, data.tags),
  );

  ipcMain.handle(ARTIFACTS_CREATE, (_e, data: ArtifactCreateInput) =>
    artifactService.create(data),
  );

  ipcMain.handle(ARTIFACTS_BACKFILL, (_e, data: { projectId: string }) =>
    artifactService.backfill(data.projectId),
  );

  artifactService.onChange((change) => {
    getWindow()?.webContents.send(ARTIFACTS_ON_CHANGED, change);
  });
}
