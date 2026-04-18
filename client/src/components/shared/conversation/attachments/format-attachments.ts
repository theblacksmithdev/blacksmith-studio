import type { AttachmentRecord } from "./types";
import type { BubbleAttachment } from "../message";

type BubbleKind = NonNullable<BubbleAttachment["kind"]>;

function bubbleKindFor(kind: AttachmentRecord["kind"]): BubbleKind {
  if (kind === "image") return "image";
  if (kind === "code") return "code";
  return "file";
}

export function toBubbleAttachments(
  records: AttachmentRecord[],
): BubbleAttachment[] {
  return records.map((r) => ({
    id: r.id,
    name: r.name,
    kind: bubbleKindFor(r.kind),
    meta: formatSize(r.size),
  }));
}

/**
 * Build a text block referencing uploaded attachments so the agent can
 * read them via relative paths. Appended to the user's message when
 * files are attached.
 */
export function formatAttachmentPromptBlock(
  records: AttachmentRecord[],
): string {
  if (records.length === 0) return "";
  const lines = records.map((r) => `- @${r.relPath} (${r.kind}, ${r.name})`);
  return ["", "", "Attached files (read via the Read tool):", ...lines].join(
    "\n",
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
