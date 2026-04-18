import fs from "node:fs";
import path from "node:path";
import type { FileNode } from "../types.js";

const DEFAULT_IGNORE = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  "venv",
  "dist",
  ".env",
  ".blacksmith-studio",
  ".claude",
  ".vscode",
  ".idea",
  "htmlcov",
  ".pytest_cache",
  ".mypy_cache",
  ".next",
  ".nuxt",
  ".output",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  ".parcel-cache",
  "target",
]);

const IGNORE_EXTENSIONS = new Set([".pyc", ".pyo", ".egg-info"]);

function isIgnored(name: string, ext: string): boolean {
  if (DEFAULT_IGNORE.has(name)) return true;
  if (IGNORE_EXTENSIONS.has(ext)) return true;
  return false;
}

/**
 * List the direct children of a directory — no recursion. Folders come
 * back with `children: []` so the client can tell "unloaded folder" from
 * "file". Callers fetch deeper levels on demand via `listChildren`.
 */
export function listChildren(
  projectRoot: string,
  relativeDir: string,
): FileNode[] {
  const currentDir = relativeDir
    ? path.resolve(projectRoot, relativeDir)
    : projectRoot;

  if (!currentDir.startsWith(projectRoot)) {
    throw new Error("Path is outside the project directory");
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const out: FileNode[] = [];
  for (const entry of sorted) {
    if (isIgnored(entry.name, path.extname(entry.name))) continue;
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(projectRoot, fullPath);
    if (entry.isDirectory()) {
      out.push({
        name: entry.name,
        path: relPath,
        type: "directory",
        children: [],
      });
    } else {
      out.push({ name: entry.name, path: relPath, type: "file" });
    }
  }
  return out;
}

/**
 * Build the shallow file tree: the project root plus its direct children.
 * Folders arrive with empty `children: []` — the client expands them
 * lazily via `listChildren`.
 */
export function buildFileTree(projectRoot: string): FileNode {
  return {
    name: path.basename(projectRoot),
    path: ".",
    type: "directory",
    children: listChildren(projectRoot, ""),
  };
}

export function readFileContent(
  projectRoot: string,
  relativePath: string,
): { content: string; language: string; size: number } {
  const fullPath = path.resolve(projectRoot, relativePath);

  // Security: ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw new Error(
      "This file is outside the project directory and can't be accessed.",
    );
  }

  const stat = fs.statSync(fullPath);
  if (stat.size > 1024 * 512) {
    throw new Error(
      "This file is too large to open (over 512 KB). Try opening it in an external editor.",
    );
  }

  const content = fs.readFileSync(fullPath, "utf-8");
  const ext = path.extname(relativePath).slice(1);
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    sql: "sql",
    sh: "bash",
    txt: "text",
    hbs: "handlebars",
  };

  return {
    content,
    language: languageMap[ext] || ext || "text",
    size: stat.size,
  };
}

export function writeFileContent(
  projectRoot: string,
  relativePath: string,
  content: string,
): void {
  const fullPath = path.resolve(projectRoot, relativePath);

  // Security: ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw new Error(
      "This file is outside the project directory and can't be saved.",
    );
  }

  fs.writeFileSync(fullPath, content, "utf-8");
}

/* ── Content Search ── */

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".toml",
  ".sql",
  ".sh",
  ".txt",
  ".hbs",
  ".env",
  ".cfg",
  ".ini",
  ".xml",
  ".svg",
  ".go",
  ".rs",
  ".java",
  ".rb",
  ".php",
  ".c",
  ".cpp",
  ".h",
  ".vue",
  ".svelte",
]);

const MAX_FILE_SIZE = 256 * 1024; // 256KB — skip large files

export interface SearchResult {
  path: string;
  name: string;
  matches: { line: number; text: string }[];
}

/**
 * Search file contents in the project for a query string.
 * Returns matching file paths with line-level matches (max 3 per file).
 */
/** Max files to scan during content search to avoid blocking the main process */
const MAX_FILES_SCANNED = 500;

export function searchFileContents(
  projectRoot: string,
  query: string,
  maxResults = 20,
): SearchResult[] {
  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];
  const q = query.toLowerCase();
  let filesScanned = 0;

  function walk(dir: string) {
    if (results.length >= maxResults || filesScanned >= MAX_FILES_SCANNED)
      return;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (results.length >= maxResults || filesScanned >= MAX_FILES_SCANNED)
        return;
      if (DEFAULT_IGNORE.has(entry.name)) continue;
      if (entry.name.startsWith(".") && DEFAULT_IGNORE.has(entry.name))
        continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (!TEXT_EXTENSIONS.has(ext)) continue;

        try {
          filesScanned++;
          const stat = fs.statSync(fullPath);
          if (stat.size > MAX_FILE_SIZE) continue;

          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          const matches: { line: number; text: string }[] = [];

          for (let i = 0; i < lines.length && matches.length < 3; i++) {
            if (lines[i].toLowerCase().includes(q)) {
              matches.push({
                line: i + 1,
                text: lines[i].trim().slice(0, 120),
              });
            }
          }

          if (matches.length > 0) {
            results.push({
              path: path.relative(projectRoot, fullPath),
              name: entry.name,
              matches,
            });
          }
        } catch {
          /* skip unreadable files */
        }
      }
    }
  }

  walk(projectRoot);
  return results;
}
