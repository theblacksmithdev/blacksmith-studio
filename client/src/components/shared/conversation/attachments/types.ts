import type { AttachmentRecord, AttachmentKind } from "@/api/modules/attachments";

export type { AttachmentRecord, AttachmentKind };

export type PendingStatus = "pending" | "uploading" | "ready" | "error";

export interface PendingAttachment {
  localId: string;
  name: string;
  size: number;
  kind: AttachmentKind;
  status: PendingStatus;
  record?: AttachmentRecord;
  error?: string;
}
