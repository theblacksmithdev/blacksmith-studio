import fs from "node:fs";
import path from "node:path";
import type { ToolInputs, ToolName } from "./schema.js";

const MAX_FILE_BYTES = 512 * 1024; // 512 KB — keep tool results bounded
const MAX_GREP_MATCHES = 200;
const MAX_GLOB_MATCHES = 500;
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "release",
  ".next",
  ".venv",
  "venv",
  "__pycache__",
  ".blacksmith-studio",
  ".blacksmith",
]);

/**
 * Executes the read-only tool calls we advertise to non-Claude
 * providers. Scoped to a single project root — every path the model
 * supplies is resolved relative to `projectRoot` and rejected if it
 * escapes it, so a misbehaving model can't read arbitrary files.
 *
 * SRP: translates a tool name + input to a string result. It does not
 * decide *when* to call tools (that's the agent loop's job) and does
 * not format results for a specific model — callers put the string in
 * whatever `role: "tool"` envelope their provider expects.
 */
export class LocalToolExecutor {
  constructor(private readonly projectRoot: string) {}

  async run<T extends ToolName>(tool: T, input: ToolInputs[T]): Promise<string> {
    try {
      switch (tool) {
        case "read_file":
          return this.readFile((input as ToolInputs["read_file"]).path);
        case "grep":
          return this.grep(input as ToolInputs["grep"]);
        case "glob":
          return this.glob((input as ToolInputs["glob"]).pattern);
        default:
          return `Unknown tool: ${tool}`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `Tool ${tool} failed: ${message}`;
    }
  }

  // ── read_file ────────────────────────────────────────────────────

  private readFile(requested: string): string {
    const resolved = this.resolveWithinRoot(requested);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      return `Error: ${requested} is a directory, not a file.`;
    }
    if (stat.size > MAX_FILE_BYTES) {
      return `Error: file is too large (${stat.size} bytes; limit ${MAX_FILE_BYTES}).`;
    }
    return fs.readFileSync(resolved, "utf-8");
  }

  // ── glob ─────────────────────────────────────────────────────────

  private glob(pattern: string): string {
    const regex = globToRegex(pattern);
    const matches: string[] = [];
    for (const rel of walk(this.projectRoot, this.projectRoot)) {
      if (regex.test(rel)) {
        matches.push(rel);
        if (matches.length >= MAX_GLOB_MATCHES) break;
      }
    }
    if (matches.length === 0) return `No files matched ${pattern}.`;
    return matches.join("\n");
  }

  // ── grep ─────────────────────────────────────────────────────────

  private grep(input: ToolInputs["grep"]): string {
    const flags = input.case_insensitive ? "i" : "";
    let regex: RegExp;
    try {
      regex = new RegExp(input.pattern, flags);
    } catch (err) {
      return `Invalid regex: ${err instanceof Error ? err.message : String(err)}`;
    }

    const searchRoot = input.path
      ? this.resolveWithinRoot(input.path)
      : this.projectRoot;
    if (!fs.existsSync(searchRoot)) return `Path not found: ${input.path}`;

    const matches: string[] = [];
    const rootStat = fs.statSync(searchRoot);
    const files = rootStat.isDirectory()
      ? walk(searchRoot, this.projectRoot)
      : [path.relative(this.projectRoot, searchRoot)];

    for (const rel of files) {
      const abs = path.join(this.projectRoot, rel);
      let content: string;
      try {
        const stat = fs.statSync(abs);
        if (stat.size > MAX_FILE_BYTES) continue;
        content = fs.readFileSync(abs, "utf-8");
      } catch {
        continue;
      }
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i]!)) {
          matches.push(`${rel}:${i + 1}: ${lines[i]!.trim()}`);
          if (matches.length >= MAX_GREP_MATCHES) {
            matches.push(`… (truncated at ${MAX_GREP_MATCHES} matches)`);
            return matches.join("\n");
          }
        }
      }
    }
    return matches.length === 0
      ? `No matches for /${input.pattern}/${flags}.`
      : matches.join("\n");
  }

  // ── helpers ──────────────────────────────────────────────────────

  /** Reject paths that escape `projectRoot` — basic path-traversal guard. */
  private resolveWithinRoot(requested: string): string {
    const abs = path.isAbsolute(requested)
      ? path.resolve(requested)
      : path.resolve(this.projectRoot, requested);
    const rel = path.relative(this.projectRoot, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      throw new Error(`Path outside project root: ${requested}`);
    }
    return abs;
  }
}

/**
 * Walk `dir` depth-first, yielding paths relative to `root`. Skips
 * vendored/generated directories by name — full .gitignore support is
 * too heavy for the gains at this scope.
 */
function* walk(dir: string, root: string): Generator<string> {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env") continue;
    if (IGNORED_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(abs, root);
    } else if (entry.isFile()) {
      yield path.relative(root, abs);
    }
  }
}

/**
 * Convert a minimal glob pattern into a regex. Handles `**` (any
 * depth), `*` (single segment), `?`, and escapes regex metacharacters.
 * Good enough for `src/**\/*.ts` and `**\/*.tsx` — we don't claim full
 * gitignore/minimatch semantics.
 */
function globToRegex(pattern: string): RegExp {
  let source = "^";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i]!;
    if (char === "*" && pattern[i + 1] === "*") {
      // `**/` consumes any depth incl. zero; bare `**` consumes any characters.
      if (pattern[i + 2] === "/") {
        source += "(?:.*/)?";
        i += 2;
      } else {
        source += ".*";
        i += 1;
      }
    } else if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else if (/[.+^${}()|[\]\\]/.test(char)) {
      source += "\\" + char;
    } else {
      source += char;
    }
  }
  source += "$";
  return new RegExp(source);
}
