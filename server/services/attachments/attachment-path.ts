import path from "node:path";
import { projectDataDir } from "../project-paths.js";

const ATTACHMENTS_SEGMENT = "attachments";

export function attachmentsRootFor(projectRoot: string): string {
  return projectDataDir(projectRoot, ATTACHMENTS_SEGMENT);
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
