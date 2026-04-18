import { api as raw } from "../client";

export type AttachmentKind = "image" | "text" | "code" | "pdf" | "file";

export interface AttachmentRecord {
  id: string;
  name: string;
  kind: AttachmentKind;
  mime: string;
  size: number;
  absPath: string;
  relPath: string;
  conversationId: string | null;
  createdAt: string;
}

export interface SaveAttachmentArgs {
  projectId: string;
  conversationId?: string;
  name: string;
  bytes: ArrayBuffer;
}

export interface ReadAttachmentResult {
  name: string;
  mime: string;
  bytes: ArrayBuffer;
}

export const attachments = {
  save: (args: SaveAttachmentArgs) =>
    raw.invoke<AttachmentRecord>("attachments:save", args),

  read: (projectId: string, absPath: string) =>
    raw.invoke<ReadAttachmentResult>("attachments:read", {
      projectId,
      absPath,
    }),

  delete: (projectId: string, absPath: string) =>
    raw.invoke<void>("attachments:delete", { projectId, absPath }),

  open: (projectId: string, absPath: string) =>
    raw.invoke<void>("attachments:open", { projectId, absPath }),
} as const;
