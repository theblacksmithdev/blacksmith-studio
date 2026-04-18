import fs from "node:fs";
import path from "node:path";
import { CODE_EXTENSIONS, IGNORED_DIRS, KEY_FILES } from "./constants.js";

/**
 * Walk a project directory and emit an indented tree listing.
 *
 * Filter rules come from constants, so changing the policy (more ignored
 * dirs, more file extensions) is a data edit — the walker doesn't change.
 */
export function scanTree(projectRoot: string, maxDepth: number): string[] {
  const lines: string[] = [];
  walk(projectRoot, 0, maxDepth, lines);
  return lines;
}

function walk(
  dir: string,
  depth: number,
  maxDepth: number,
  out: string[],
): void {
  if (depth > maxDepth) return;

  const entries = readDir(dir);
  const indent = "  ".repeat(depth);

  for (const entry of entries) {
    if (entry.isDirectory()) {
      out.push(`${indent}${entry.name}/`);
      walk(path.join(dir, entry.name), depth + 1, maxDepth, out);
    } else if (shouldIncludeFile(entry.name)) {
      out.push(`${indent}${entry.name}`);
    }
  }
}

function readDir(dir: string): fs.Dirent[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.filter((e) => !shouldSkip(e.name)).sort(compareDirent);
}

function shouldSkip(name: string): boolean {
  return name.startsWith(".") || IGNORED_DIRS.has(name);
}

function shouldIncludeFile(name: string): boolean {
  return CODE_EXTENSIONS.has(path.extname(name)) || KEY_FILES.includes(name);
}

function compareDirent(a: fs.Dirent, b: fs.Dirent): number {
  if (a.isDirectory() && !b.isDirectory()) return -1;
  if (!a.isDirectory() && b.isDirectory()) return 1;
  return a.name.localeCompare(b.name);
}
