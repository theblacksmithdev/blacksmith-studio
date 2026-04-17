import { execSync } from "node:child_process";

export interface ChangeSnapshot {
  /** Git commit hash at the time of snapshot, or null if no commits */
  commitHash: string | null;
  /** Whether the working tree was clean at snapshot time */
  wasClean: boolean;
}

export interface ChangeSet {
  /** List of files that were added, modified, or deleted */
  files: ChangedFile[];
  /** Full unified diff of all changes */
  diff: string;
  /** Short stat summary (e.g. "5 files changed, 120 insertions(+), 10 deletions(-)") */
  stat: string;
}

export interface ChangedFile {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
}

/**
 * Take a snapshot of the current git state before agents start working.
 * Returns the current HEAD commit hash and working tree status.
 */
export function takeSnapshot(projectRoot: string): ChangeSnapshot {
  try {
    const commitHash = execSync("git rev-parse HEAD", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    const status = execSync("git status --porcelain", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    return { commitHash, wasClean: status.length === 0 };
  } catch {
    return { commitHash: null, wasClean: true };
  }
}

/**
 * Compute the changes made since a snapshot.
 * Compares current working tree against the snapshot commit.
 * Captures both staged/unstaged changes and new commits.
 */
export function computeChanges(
  projectRoot: string,
  snapshot: ChangeSnapshot,
): ChangeSet {
  const empty: ChangeSet = { files: [], diff: "", stat: "" };

  if (!snapshot.commitHash) return empty;

  try {
    // Get the full diff against the snapshot commit
    // This catches: new commits, staged changes, and unstaged changes
    const diff = execSync(`git diff ${snapshot.commitHash} --no-color`, {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 30000,
      maxBuffer: 1024 * 1024 * 5, // 5MB max for large diffs
    }).trim();

    const stat = execSync(`git diff ${snapshot.commitHash} --stat --no-color`, {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 10000,
    }).trim();

    // Also include untracked files (new files the agents created but didn't git add)
    const untracked = execSync("git ls-files --others --exclude-standard", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    // Parse changed files from diff --name-status
    const nameStatus = execSync(
      `git diff ${snapshot.commitHash} --name-status --no-color`,
      {
        cwd: projectRoot,
        encoding: "utf-8",
        timeout: 10000,
      },
    ).trim();

    const files: ChangedFile[] = [];

    for (const line of nameStatus.split("\n")) {
      if (!line.trim()) continue;
      const [statusChar, ...pathParts] = line.split("\t");
      const filePath = pathParts.join("\t"); // handle paths with tabs (rare)
      if (!filePath) continue;

      let status: ChangedFile["status"] = "modified";
      if (statusChar.startsWith("A")) status = "added";
      else if (statusChar.startsWith("D")) status = "deleted";
      else if (statusChar.startsWith("R")) status = "renamed";

      files.push({ path: filePath, status });
    }

    // Add untracked files as 'added'
    for (const line of untracked.split("\n")) {
      const filePath = line.trim();
      if (filePath && !files.some((f) => f.path === filePath)) {
        files.push({ path: filePath, status: "added" });
      }
    }

    return { files, diff, stat };
  } catch (err) {
    console.warn("[change-tracker] Failed to compute changes:", err);
    return empty;
  }
}

/**
 * Format a ChangeSet into a human-readable context string for the code reviewer.
 * Includes the file list and the actual diff content.
 */
export function formatChangesForReview(changes: ChangeSet): string {
  if (changes.files.length === 0) return "";

  const lines: string[] = ["## Files Changed in This Dispatch\n"];

  // File list grouped by status
  const added = changes.files.filter((f) => f.status === "added");
  const modified = changes.files.filter((f) => f.status === "modified");
  const deleted = changes.files.filter((f) => f.status === "deleted");

  if (added.length > 0) {
    lines.push("**New files:**");
    for (const f of added) lines.push(`  + ${f.path}`);
  }
  if (modified.length > 0) {
    lines.push("**Modified files:**");
    for (const f of modified) lines.push(`  ~ ${f.path}`);
  }
  if (deleted.length > 0) {
    lines.push("**Deleted files:**");
    for (const f of deleted) lines.push(`  - ${f.path}`);
  }

  lines.push("");

  if (changes.stat) {
    lines.push(`**Stats:** ${changes.stat.split("\n").pop() ?? ""}`);
    lines.push("");
  }

  // Include the actual diff (truncated for very large diffs)
  if (changes.diff) {
    const maxDiffSize = 15000;
    const truncated = changes.diff.length > maxDiffSize;
    lines.push("## Diff\n```diff");
    lines.push(
      truncated
        ? changes.diff.slice(0, maxDiffSize) + "\n... (truncated)"
        : changes.diff,
    );
    lines.push("```");
  }

  return lines.join("\n");
}
