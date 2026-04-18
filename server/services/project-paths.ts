import path from "node:path";

/**
 * Project-local dotfolder where Blacksmith stores its per-project state:
 * attachments, agent artifacts, knowledge-graph output, knowledge docs,
 * and similar. Lives at `<projectRoot>/.blacksmith/`.
 *
 * Separate from the user-home app folder (`~/.blacksmith-studio/`) which
 * holds the global SQLite database and venv.
 */
export const PROJECT_DATA_DIR = ".blacksmith";

/**
 * Absolute path inside the project's data dir. Empty segments are joined
 * correctly so `projectDataDir(root)` returns just `<root>/.blacksmith`.
 */
export function projectDataDir(
  projectRoot: string,
  ...segments: string[]
): string {
  return path.join(projectRoot, PROJECT_DATA_DIR, ...segments);
}

/**
 * POSIX-style path relative to the project root — handy when the value
 * is shown to an agent or used as an `@path` reference.
 */
export function projectDataRelPath(...segments: string[]): string {
  return [PROJECT_DATA_DIR, ...segments].join("/");
}
