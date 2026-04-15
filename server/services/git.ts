import simpleGit, {
  type SimpleGit,
  type StatusResult,
  type DefaultLogFields,
  type ListLogLine,
} from "simple-git";
import { watch, type FSWatcher } from "node:fs";
import path from "node:path";
import {
  paginate,
  type PaginationInput,
  type PaginatedResult,
} from "../types.js";
import { AiModelTier } from "./ai/types.js";
import type { Ai } from "./ai/ai.js";

/* ── Types ── */

export interface GitStatus {
  initialized: boolean;
  branch: string;
  changedCount: number;
  syncStatus:
    | "synced"
    | "ahead"
    | "behind"
    | "diverged"
    | "local-only"
    | "unknown";
  ahead: number;
  behind: number;
}

export interface ChangedFile {
  path: string;
  status: "modified" | "added" | "deleted" | "renamed" | "untracked";
  staged: boolean;
}

export interface CommitEntry {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}

export interface CommitDetail {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: {
    path: string;
    status: string;
    insertions: number;
    deletions: number;
  }[];
  diff: string;
}

export interface BranchInfo {
  name: string;
  current: boolean;
  label: string;
}

export interface SyncStatus {
  ahead: number;
  behind: number;
  hasRemote: boolean;
}

export interface ConflictFile {
  path: string;
}

/* ── GitManager ── */

export class GitManager {
  private watchers = new Map<string, FSWatcher>();
  private statusCallbacks: Array<(projectPath: string) => void> = [];

  private git(projectPath: string): SimpleGit {
    return simpleGit(projectPath);
  }

  /* ── Status ── */

  async getStatus(projectPath: string): Promise<GitStatus> {
    const git = this.git(projectPath);

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo)
        return {
          initialized: false,
          branch: "",
          changedCount: 0,
          syncStatus: "unknown",
          ahead: 0,
          behind: 0,
        };

      const status = await git.status();
      const syncStatus = await this.computeSyncStatus(git, status);

      return {
        initialized: true,
        branch: status.current ?? "HEAD",
        changedCount: status.files.length,
        syncStatus: syncStatus.status,
        ahead: syncStatus.ahead,
        behind: syncStatus.behind,
      };
    } catch {
      return {
        initialized: false,
        branch: "",
        changedCount: 0,
        syncStatus: "unknown",
        ahead: 0,
        behind: 0,
      };
    }
  }

  async getChangedFiles(
    projectPath: string,
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<ChangedFile>> {
    const git = this.git(projectPath);
    const status = await git.status();

    const all = status.files.map((f) => ({
      path: f.path,
      status: this.mapFileStatus(f.working_dir, f.index),
      staged: f.index !== " " && f.index !== "?",
    }));

    return paginate(all, pagination);
  }

  /** Max diff size in characters to prevent freezing the renderer */
  private static MAX_DIFF_SIZE = 500_000; // ~500KB

  async getDiff(projectPath: string, filePath: string): Promise<string> {
    const git = this.git(projectPath);

    // Try staged diff first, then unstaged, then untracked
    let diff = await git.diff(["--cached", "--", filePath]);

    if (!diff) {
      diff = await git.diff(["--", filePath]);
    }

    if (!diff) {
      // Possibly untracked — show full content as additions
      try {
        const { readFile } = await import("node:fs/promises");
        const { stat } = await import("node:fs/promises");
        const fileStat = await stat(path.join(projectPath, filePath)).catch(
          () => null,
        );
        if (!fileStat || fileStat.size > GitManager.MAX_DIFF_SIZE) return "";
        const content = await readFile(
          path.join(projectPath, filePath),
          "utf-8",
        );
        return content
          .split("\n")
          .map((l) => `+${l}`)
          .join("\n");
      } catch {
        return "";
      }
    }

    // Cap diff size to prevent renderer freeze
    if (diff.length > GitManager.MAX_DIFF_SIZE) {
      return (
        diff.slice(0, GitManager.MAX_DIFF_SIZE) +
        "\n\n... diff truncated (file too large to display)"
      );
    }

    return diff;
  }

  /* ── Commits ── */

  async commit(
    projectPath: string,
    message: string,
    files?: string[],
  ): Promise<string> {
    const git = this.git(projectPath);

    if (files && files.length > 0) {
      await git.add(files);
    } else {
      await git.add(".");
    }

    const result = await git.commit(message);
    this.emitStatusChange(projectPath);
    return result.commit;
  }

  private static COMMIT_SYSTEM = [
    "You generate concise git commit messages from diffs.",
    "Use conventional commit format: type(scope): description.",
    "Types: feat, fix, refactor, style, docs, test, chore, perf.",
    "Scope is optional. Lowercase imperative mood, max 72 chars.",
    "Output ONLY the message — no quotes, no explanation, no body.",
  ].join(" ");

  async generateMessage(projectPath: string, ai?: Ai): Promise<string> {
    const git = this.git(projectPath);
    const diff = await this.collectDiff(git);
    if (!diff) return this.fallbackMessage(git);

    if (ai) {
      try {
        const result = await ai.complete({
          prompt: diff,
          systemPrompt: GitManager.COMMIT_SYSTEM,
          model: AiModelTier.Fast,
          cwd: projectPath,
          timeout: 30000,
        });

        if (result) {
          const line = result
            .replace(/^["'`]+|["'`]+$/g, "")
            .split("\n")[0]
            .trim();
          if (line.length > 0 && line.length < 150) return line;
        }
      } catch {
        // Fall through to basic message
      }
    }

    return this.fallbackMessage(git);
  }

  private async collectDiff(git: SimpleGit): Promise<string> {
    try {
      const [staged, unstaged] = await Promise.all([
        git.diff(["--cached"]),
        git.diff(),
      ]);
      const combined = [staged, unstaged].filter(Boolean).join("\n");
      if (!combined) return "";
      return combined.length > 12000
        ? combined.slice(0, 12000) + "\n...(truncated)"
        : combined;
    } catch {
      return "";
    }
  }

  private async fallbackMessage(git: SimpleGit): Promise<string> {
    try {
      const s = await git.status();
      const counts = [
        s.files.filter((f) => f.working_dir === "?" || f.index === "A").length,
        s.files.filter((f) => f.working_dir === "M" || f.index === "M").length,
        s.files.filter((f) => f.working_dir === "D" || f.index === "D").length,
      ];
      const labels = ["add", "update", "remove"];
      return (
        counts
          .map((n, i) => (n ? `${labels[i]} ${n} file${n > 1 ? "s" : ""}` : ""))
          .filter(Boolean)
          .join(", ") || "save changes"
      );
    } catch {
      return "save changes";
    }
  }

  async getHistory(projectPath: string, limit = 50): Promise<CommitEntry[]> {
    const git = this.git(projectPath);

    try {
      const log = await git.log({ maxCount: limit });

      return log.all.map((entry: DefaultLogFields & ListLogLine) => ({
        hash: entry.hash,
        message: entry.message,
        author: entry.author_name,
        date: entry.date,
        filesChanged: 0,
      }));
    } catch {
      return [];
    }
  }

  async getCommitDetail(
    projectPath: string,
    hash: string,
  ): Promise<CommitDetail> {
    const git = this.git(projectPath);
    const EMPTY_TREE = "4b825dc642cb6eb9a060e54bf899d15f3f462b21";

    // Get commit metadata
    const logRaw = await git.raw([
      "log",
      "-1",
      "--format=%H%n%s%n%an%n%aI",
      hash,
    ]);
    const [fullHash, message, author, date] = logRaw.trim().split("\n");
    if (!fullHash) throw new Error(`Commit ${hash} not found`);

    // Check if commit has a parent
    const parentRaw = await git.raw(["rev-parse", `${hash}^`]).catch(() => "");
    const parent = parentRaw.trim() || EMPTY_TREE;

    // Fetch diff and file stats in parallel
    const [rawDiff, numstatRaw] = await Promise.all([
      git.raw(["diff", parent, hash]),
      git.raw(["diff", "--numstat", parent, hash]),
    ]);

    // Cap diff size
    const diff =
      rawDiff.length > GitManager.MAX_DIFF_SIZE
        ? rawDiff.slice(0, GitManager.MAX_DIFF_SIZE) +
          "\n\n... diff truncated (too large to display)"
        : rawDiff;

    const files = numstatRaw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [ins, del, ...pathParts] = line.split("\t");
        return {
          path: pathParts.join("\t"),
          status: "modified",
          insertions: parseInt(ins) || 0,
          deletions: parseInt(del) || 0,
        };
      });

    return { hash: fullHash, message, author, date, files, diff };
  }

  /* ── Branches ── */

  async listBranches(projectPath: string): Promise<BranchInfo[]> {
    const git = this.git(projectPath);
    const summary = await git.branchLocal();

    return summary.all.map((name) => ({
      name,
      current: name === summary.current,
      label: name,
    }));
  }

  async createBranch(projectPath: string, name: string): Promise<void> {
    const git = this.git(projectPath);
    await git.checkoutLocalBranch(name);
    this.emitStatusChange(projectPath);
  }

  async switchBranch(projectPath: string, name: string): Promise<void> {
    const git = this.git(projectPath);
    await git.checkout(name);
    this.emitStatusChange(projectPath);
  }

  async merge(
    projectPath: string,
    source: string,
    target: string,
  ): Promise<{ success: boolean; conflicts: string[] }> {
    const git = this.git(projectPath);

    // Switch to target first
    await git.checkout(target);

    try {
      await git.merge([source]);
      this.emitStatusChange(projectPath);
      return { success: true, conflicts: [] };
    } catch (err: any) {
      // Merge conflict
      const status = await git.status();
      const conflicts = status.conflicted;
      return { success: false, conflicts };
    }
  }

  /* ── Push / Pull ── */

  async sync(
    projectPath: string,
  ): Promise<{ success: boolean; error?: string }> {
    const git = this.git(projectPath);

    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0)
        return { success: false, error: "No remote configured" };

      await git.pull({ "--rebase": "false" } as any);
      await git.push();
      this.emitStatusChange(projectPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async getSyncStatus(projectPath: string): Promise<SyncStatus> {
    const git = this.git(projectPath);

    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0)
        return { ahead: 0, behind: 0, hasRemote: false };

      // Use cached tracking info — don't call git fetch here as it's a network call
      // that can block for seconds. Fetching happens during explicit sync instead.
      const status = await git.status();
      return {
        ahead: status.ahead,
        behind: status.behind,
        hasRemote: true,
      };
    } catch {
      return { ahead: 0, behind: 0, hasRemote: false };
    }
  }

  /* ── Conflicts ── */

  async getConflicts(projectPath: string): Promise<ConflictFile[]> {
    const git = this.git(projectPath);
    const status = await git.status();
    return status.conflicted.map((p) => ({ path: p }));
  }

  async resolveConflict(
    projectPath: string,
    filePath: string,
    resolution: "ours" | "theirs",
  ): Promise<void> {
    const git = this.git(projectPath);

    if (resolution === "ours") {
      await git.raw(["checkout", "--ours", "--", filePath]);
    } else {
      await git.raw(["checkout", "--theirs", "--", filePath]);
    }

    await git.add(filePath);
    this.emitStatusChange(projectPath);
  }

  /* ── Init ── */

  async init(projectPath: string): Promise<void> {
    const git = this.git(projectPath);
    await git.init();
    // Create initial commit
    await git.add(".");
    await git.commit("Initial project setup");
    this.emitStatusChange(projectPath);
  }

  /* ── File Watching ── */

  onStatusChange(cb: (projectPath: string) => void) {
    this.statusCallbacks.push(cb);
  }

  startWatching(projectPath: string) {
    if (this.watchers.has(projectPath)) return;

    let watchDebounce: ReturnType<typeof setTimeout> | null = null;

    try {
      const watcher = watch(
        projectPath,
        { recursive: true },
        (_event, filename) => {
          if (!filename) return;
          // Ignore .git directory changes, node_modules, and build artifacts
          if (
            filename.startsWith(".git") ||
            filename.includes("node_modules") ||
            filename.includes("dist/")
          )
            return;
          // Debounce: batch rapid file changes into a single status update
          if (watchDebounce) clearTimeout(watchDebounce);
          watchDebounce = setTimeout(
            () => this.emitStatusChange(projectPath),
            1000,
          );
        },
      );

      this.watchers.set(projectPath, watcher);
    } catch {
      // Watch not supported or path invalid — silently skip
    }
  }

  stopWatching(projectPath: string) {
    const watcher = this.watchers.get(projectPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(projectPath);
    }
  }

  stopAllWatching() {
    for (const [, watcher] of this.watchers) watcher.close();
    this.watchers.clear();
  }

  /* ── Private ── */

  private emitStatusChange(projectPath: string) {
    for (const cb of this.statusCallbacks) cb(projectPath);
  }

  private async computeSyncStatus(
    git: SimpleGit,
    status: StatusResult,
  ): Promise<{
    status: GitStatus["syncStatus"];
    ahead: number;
    behind: number;
  }> {
    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0)
        return { status: "local-only", ahead: 0, behind: 0 };

      if (status.ahead > 0 && status.behind > 0)
        return {
          status: "diverged",
          ahead: status.ahead,
          behind: status.behind,
        };
      if (status.ahead > 0)
        return { status: "ahead", ahead: status.ahead, behind: 0 };
      if (status.behind > 0)
        return { status: "behind", ahead: 0, behind: status.behind };
      return { status: "synced", ahead: 0, behind: 0 };
    } catch {
      return { status: "unknown", ahead: 0, behind: 0 };
    }
  }

  private mapFileStatus(
    workingDir: string,
    index: string,
  ): ChangedFile["status"] {
    if (workingDir === "?" || index === "?") return "untracked";
    if (workingDir === "D" || index === "D") return "deleted";
    if (workingDir === "A" || index === "A") return "added";
    if (workingDir === "R" || index === "R") return "renamed";
    return "modified";
  }
}
