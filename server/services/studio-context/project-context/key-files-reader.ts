import fs from "node:fs";
import path from "node:path";
import {
  KEY_FILES,
  MAX_KEY_FILE_BYTES,
  NESTED_KEY_FILE_DIRS,
} from "./constants.js";

export interface KeyFile {
  /** Path relative to the project root, using `/`. */
  relativePath: string;
  /** File contents, trimmed. */
  content: string;
}

/**
 * Locate and read the project's key config/context files.
 *
 * Which files and where they live is entirely data-driven via constants.
 * Large files are silently skipped — their content would dominate the
 * prompt and usually doesn't add useful signal above their presence.
 */
export function readKeyFiles(projectRoot: string): KeyFile[] {
  const found: KeyFile[] = [];
  for (const name of KEY_FILES) {
    tryAdd(projectRoot, name, found);
    for (const sub of NESTED_KEY_FILE_DIRS) {
      tryAdd(projectRoot, path.join(sub, name), found);
    }
  }
  return found;
}

function tryAdd(
  projectRoot: string,
  relativePath: string,
  out: KeyFile[],
): void {
  const absPath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absPath)) return;

  try {
    const stat = fs.statSync(absPath);
    if (stat.size > MAX_KEY_FILE_BYTES) return;
    const content = fs.readFileSync(absPath, "utf-8").trim();
    out.push({ relativePath, content });
  } catch {
    /* skip unreadable files */
  }
}
