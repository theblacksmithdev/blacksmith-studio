import { ipcMain, shell } from "electron";
import type { AttachmentService } from "../../server/services/attachments/index.js";
import {
  ATTACHMENTS_SAVE,
  ATTACHMENTS_SAVE_FROM_PATH,
  ATTACHMENTS_READ,
  ATTACHMENTS_DELETE,
  ATTACHMENTS_OPEN,
} from "./channels.js";

export function setupAttachmentsIPC(attachments: AttachmentService) {
  ipcMain.handle(
    ATTACHMENTS_SAVE,
    async (
      _e,
      data: {
        projectId: string;
        conversationId?: string;
        name: string;
        bytes: ArrayBuffer | Uint8Array;
      },
    ) => {
      return attachments.save({
        projectId: data.projectId,
        conversationId: data.conversationId,
        name: data.name,
        bytes: data.bytes,
      });
    },
  );

  ipcMain.handle(
    ATTACHMENTS_SAVE_FROM_PATH,
    async (
      _e,
      data: {
        projectId: string;
        conversationId?: string;
        sourcePath: string;
      },
    ) => {
      return attachments.saveFromPath({
        projectId: data.projectId,
        conversationId: data.conversationId,
        sourcePath: data.sourcePath,
      });
    },
  );

  ipcMain.handle(
    ATTACHMENTS_READ,
    async (_e, data: { projectId: string; absPath: string }) => {
      const { bytes, mime, name } = await attachments.read(
        data.projectId,
        data.absPath,
      );
      return {
        name,
        mime,
        bytes: bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ),
      };
    },
  );

  ipcMain.handle(
    ATTACHMENTS_DELETE,
    async (_e, data: { projectId: string; absPath: string }) => {
      await attachments.remove(data.projectId, data.absPath);
    },
  );

  ipcMain.handle(
    ATTACHMENTS_OPEN,
    async (_e, data: { projectId: string; absPath: string }) => {
      await attachments.assertInProject(data.projectId, data.absPath);
      const exists = await attachments.exists(data.absPath);
      if (!exists) throw new Error("Attachment no longer exists");
      const err = await shell.openPath(data.absPath);
      if (err) throw new Error(err);
    },
  );
}
