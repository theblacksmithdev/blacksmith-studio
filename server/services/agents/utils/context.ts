import fs from "node:fs";
import path from "node:path";
import type { AgentRoleDefinition } from "../types.js";

const GRAPHIFY_REPORT_PATH = ".blacksmith/graphify/GRAPH_REPORT.md";
const MAX_REPORT_SIZE = 32 * 1024;

function readGraphReport(projectRoot: string): string | null {
  const reportPath = path.join(projectRoot, GRAPHIFY_REPORT_PATH);
  if (!fs.existsSync(reportPath)) return null;
  try {
    const content = fs.readFileSync(reportPath, "utf-8");
    return content.length > MAX_REPORT_SIZE
      ? content.slice(0, MAX_REPORT_SIZE) + "\n\n[... truncated]"
      : content;
  } catch {
    return null;
  }
}

const IGNORE = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  "venv",
  "dist",
  ".env",
  ".blacksmith-studio",
  ".claude",
  "build",
  "coverage",
  ".next",
]);

/**
 * Builds a filtered project context tailored to an agent's scope.
 * Only includes files and directories relevant to the agent's role,
 * keeping token usage low and focus high.
 *
 * When a Graphify graph report is available, it's automatically injected
 * as a compact project overview and the directory tree depth is reduced
 * (the graph already captures structure). Key files are still included.
 */
export function buildAgentContext(
  projectRoot: string,
  role: AgentRoleDefinition,
): string {
  const graphReport = readGraphReport(projectRoot);
  const lines: string[] = [];
  const scopeDirs = role.scopeDirs.length > 0 ? role.scopeDirs : ["."];

  // Inject graph report as a rich structural overview when available
  if (graphReport) {
    lines.push("## Project Knowledge Graph\n");
    lines.push(graphReport);
    lines.push("");
  }

  // Scope-specific directory tree — shallower when graph provides structure
  const treeDepth = graphReport ? 2 : 4;
  lines.push(`## Scope: ${role.title}\n`);
  lines.push("```");

  for (const dir of scopeDirs) {
    const absDir = path.join(projectRoot, dir);
    if (!fs.existsSync(absDir)) continue;
    lines.push(`${dir}/`);
    buildFilteredTree(absDir, role.filePatterns, lines, 1, treeDepth);
  }

  lines.push("```\n");

  // Key config/entry files relevant to this role
  const keyContents = collectKeyFiles(projectRoot, role);
  if (keyContents.length > 0) {
    lines.push("## Key Files\n");
    for (const { relativePath, content } of keyContents) {
      lines.push(`### ${relativePath}\n\`\`\`\n${content}\n\`\`\`\n`);
    }
  }

  return lines.join("\n");
}

function buildFilteredTree(
  dir: string,
  patterns: string[],
  lines: string[],
  depth: number,
  maxDepth: number,
): void {
  if (depth > maxDepth) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const filtered = entries
    .filter((e) => !e.name.startsWith(".") && !IGNORE.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const indent = "  ".repeat(depth);

  for (const entry of filtered) {
    if (entry.isDirectory()) {
      lines.push(`${indent}${entry.name}/`);
      buildFilteredTree(
        path.join(dir, entry.name),
        patterns,
        lines,
        depth + 1,
        maxDepth,
      );
    } else if (matchesPatterns(entry.name, patterns)) {
      lines.push(`${indent}${entry.name}`);
    }
  }
}

function matchesPatterns(filename: string, patterns: string[]): boolean {
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern.startsWith("*.")) {
      return filename.endsWith(pattern.slice(1));
    }
    return filename === pattern || filename.includes(pattern);
  });
}

/**
 * Collect small, relevant config/entry files for context injection.
 * Reads from both the project root AND each scope dir to catch
 * top-level configs (package.json) as well as scoped ones (frontend/tsconfig.json).
 */
function collectKeyFiles(
  projectRoot: string,
  role: AgentRoleDefinition,
): { relativePath: string; content: string }[] {
  const results: { relativePath: string; content: string }[] = [];
  const seen = new Set<string>();
  const MAX_FILE_SIZE = 8192;
  const MAX_TOTAL = 24 * 1024;
  let totalSize = 0;

  const keyFiles = role.keyFiles;

  // Always check root first, then scope dirs
  const searchDirs = ["."];
  for (const dir of role.scopeDirs) {
    if (dir !== "." && !searchDirs.includes(dir)) {
      searchDirs.push(dir);
    }
  }

  for (const dir of searchDirs) {
    for (const file of keyFiles) {
      const filePath = path.join(projectRoot, dir, file);

      // Deduplicate by resolved path
      const resolved = path.resolve(filePath);
      if (seen.has(resolved)) continue;
      seen.add(resolved);

      if (!fs.existsSync(filePath)) continue;

      try {
        const stat = fs.statSync(filePath);
        // Skip directories and oversized files
        if (!stat.isFile()) continue;
        if (stat.size > MAX_FILE_SIZE) continue;
        if (totalSize + stat.size > MAX_TOTAL) return results;

        const content = fs.readFileSync(filePath, "utf-8").trim();
        if (content) {
          const relativePath = dir === "." ? file : path.join(dir, file);
          results.push({ relativePath, content });
          totalSize += stat.size;
        }
      } catch {
        /* skip unreadable files */
      }
    }
  }

  return results;
}
