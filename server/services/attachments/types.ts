export type AttachmentKind = "image" | "text" | "code" | "pdf" | "file";

export interface AttachmentRecord {
  id: string;
  name: string;
  kind: AttachmentKind;
  mime: string;
  size: number;
  /** Absolute path on disk. */
  absPath: string;
  /** Path relative to project root (forward slashes). */
  relPath: string;
  conversationId: string | null;
  createdAt: string;
}

export interface SaveAttachmentInput {
  projectId: string;
  conversationId?: string;
  name: string;
  bytes: ArrayBuffer | Uint8Array;
}
