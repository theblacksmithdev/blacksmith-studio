import type { StoredMessageAttachment } from "../../types.js";

interface PathLike {
  relPath: string;
  name?: string;
  kind?: string;
}

/**
 * Build an instruction block for Claude describing attached files, so it
 * can Read them. Appended only when invoking the AI — not stored in the
 * user-facing message content.
 */
export function buildAttachmentInstruction(
  attachments: readonly (PathLike | StoredMessageAttachment)[] | undefined,
): string {
  if (!attachments || attachments.length === 0) return "";
  const lines = attachments.map((a) => `- @${a.relPath}`);
  return [
    "",
    "",
    "The user attached these files. Read them as needed:",
    ...lines,
  ].join("\n");
}

export function appendAttachmentInstruction(
  prompt: string,
  attachments: readonly (PathLike | StoredMessageAttachment)[] | undefined,
): string {
  const block = buildAttachmentInstruction(attachments);
  return block ? `${prompt}${block}` : prompt;
}
