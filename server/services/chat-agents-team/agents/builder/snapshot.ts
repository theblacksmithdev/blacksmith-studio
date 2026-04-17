import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const IGNORE = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  "venv",
  "dist",
  ".blacksmith-studio",
  ".claude",
  "build",
  "coverage",
  ".next",
]);

/**
 * Capture the project's file state after a phase completes.
 * Used as context for the next phase so agents know what files exist.
 */
export function capturePhaseSnapshot(
  projectRoot: string,
  phaseName: string,
): string | null {
  try {
    const parts: string[] = [`## Project State After "${phaseName}"`];

    // Git diff if available
    try {
      const diffStat = execSync(
        "git diff --stat HEAD 2>/dev/null || git diff --stat 2>/dev/null",
        {
          cwd: projectRoot,
          encoding: "utf-8" as const,
          timeout: 10000,
        },
      )
        .toString()
        .trim();

      if (diffStat) {
        parts.push(`### Changes\n\`\`\`\n${diffStat}\n\`\`\``);
      }
    } catch {
      /* no git */
    }

    // File listing (filtered, no node_modules/venv/.git)
    const files = collectFiles(projectRoot, projectRoot, 3);
    if (files.length > 0) {
      parts.push(`### File Listing\n\`\`\`\n${files.join("\n")}\n\`\`\``);
    }

    return parts.length > 1 ? parts.join("\n") : null;
  } catch (err) {
    console.warn(
      `[snapshot] Failed to capture snapshot after "${phaseName}":`,
      err,
    );
    return null;
  }
}

function collectFiles(
  root: string,
  dir: string,
  maxDepth: number,
  depth = 0,
): string[] {
  if (depth > maxDepth) return [];

  const results: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && depth === 0 && !IGNORE.has(entry.name))
      continue;
    if (IGNORE.has(entry.name)) continue;

    const rel = path.relative(root, path.join(dir, entry.name));

    if (entry.isDirectory()) {
      results.push(`${rel}/`);
      results.push(
        ...collectFiles(root, path.join(dir, entry.name), maxDepth, depth + 1),
      );
    } else {
      results.push(rel);
    }

    if (results.length >= 150) break;
  }

  return results;
}
