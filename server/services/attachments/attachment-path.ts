import path from "node:path";

const ROOT_SEGMENT = ".studio";
const ATTACHMENTS_SEGMENT = "attachments";

export function attachmentsRootFor(projectRoot: string): string {
  return path.join(projectRoot, ROOT_SEGMENT, ATTACHMENTS_SEGMENT);
}

export function attachmentsDirFor(
  projectRoot: string,
  conversationId: string | null,
): string {
  const bucket = conversationId ?? "shared";
  return path.join(attachmentsRootFor(projectRoot), bucket);
}

export function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

export function relativeToProject(projectRoot: string, abs: string): string {
  const rel = path.relative(projectRoot, abs);
  return toPosix(rel);
}
