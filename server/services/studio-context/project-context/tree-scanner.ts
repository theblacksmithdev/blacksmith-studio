import fs from "node:fs";
import path from "node:path";
import {
  CODE_EXTENSIONS,
  IGNORED_DIRS,
  KEY_FILES,
} from "./constants.js";

/**
 * Walks a project directory and emits an indented tree listing.
 *
 * Single Responsibility: produce the markdown-friendly tree block. Filter
 * rules (ignored dirs, included extensions) come from constants so a
 * change to the policy doesn't require editing the walker.
 *
 * Open/Closed: the file-inclusion rule is two data sets (CODE_EXTENSIONS,
 * KEY_FILES) — extending inclusions is additive.
 */
export class TreeScanner {
  /** Build the tree as an array of lines with 2-space indents per depth level. */
  scan(projectRoot: string, maxDepth: number): string[] {
    const lines: string[] = [];
    this.walk(projectRoot, 0, maxDepth, lines);
    return lines;
  }

  private walk(
    dir: string,
    depth: number,
    maxDepth: number,
    out: string[],
  ): void {
    if (depth > maxDepth) return;

    const entries = this.readDir(dir);
    const indent = "  ".repeat(depth);

    for (const entry of entries) {
      if (entry.isDirectory()) {
        out.push(`${indent}${entry.name}/`);
        this.walk(path.join(dir, entry.name), depth + 1, maxDepth, out);
      } else if (this.shouldIncludeFile(entry.name)) {
        out.push(`${indent}${entry.name}`);
      }
    }
  }

  private readDir(dir: string): fs.Dirent[] {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    return entries
      .filter((e) => !this.shouldSkip(e.name))
      .sort((a, b) => this.compare(a, b));
  }

  private shouldSkip(name: string): boolean {
    return name.startsWith(".") || IGNORED_DIRS.has(name);
  }

  private shouldIncludeFile(name: string): boolean {
    return (
      CODE_EXTENSIONS.has(path.extname(name)) ||
      KEY_FILES.includes(name)
    );
  }

  private compare(a: fs.Dirent, b: fs.Dirent): number {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  }
}
