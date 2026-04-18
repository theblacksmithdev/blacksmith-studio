import path from "node:path";
import { stat, readFile } from "node:fs/promises";
import {
  paginate,
  type PaginationInput,
  type PaginatedResult,
} from "../../../types.js";
import { MAX_DIFF_SIZE } from "../constants.js";
import { capDiff, asAllAdditionsDiff } from "../diff-formatter.js";
import type { GitClient } from "../git-client.js";
import type { ChangedFile, FileStatus } from "../types.js";

/**
 * Working-tree file operations: listing changed files, reading per-file diffs.
 *
 * Single Responsibility: translate simple-git's working-tree view into
 * the application's typed ChangedFile shape, and resolve diffs across
 * the staged / unstaged / untracked cases uniformly.
 */
export class FilesService {
  constructor(private readonly client: GitClient) {}

  async getChangedFiles(
    projectPath: string,
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<ChangedFile>> {
    const git = this.client.of(projectPath);
    const status = await git.status();

    const files: ChangedFile[] = status.files.map((f) => ({
      path: f.path,
      status: mapFileStatus(f.working_dir, f.index),
      staged: f.index !== " " && f.index !== "?",
    }));

    return paginate(files, pagination);
  }

  /**
   * Resolve the diff for one file. Tries staged → unstaged → untracked in
   * order, so callers don't need to care which bucket the change is in.
   */
  async getDiff(projectPath: string, filePath: string): Promise<string> {
    const git = this.client.of(projectPath);

    const staged = await git.diff(["--cached", "--", filePath]);
    if (staged) return capDiff(staged);

    const unstaged = await git.diff(["--", filePath]);
    if (unstaged) return capDiff(unstaged);

    return this.readUntracked(projectPath, filePath);
  }

  /** Render an untracked file's current content as an all-additions diff. */
  private async readUntracked(
    projectPath: string,
    filePath: string,
  ): Promise<string> {
    const absPath = path.join(projectPath, filePath);
    try {
      const fileStat = await stat(absPath).catch(() => null);
      if (!fileStat || fileStat.size > MAX_DIFF_SIZE) return "";
      const content = await readFile(absPath, "utf-8");
      return asAllAdditionsDiff(content);
    } catch {
      return "";
    }
  }
}

/**
 * Classify a simple-git working_dir/index status pair into one of the
 * application's FileStatus values. Table-driven — extending is a single
 * extra entry.
 */
const STATUS_PRIORITIES: { match: string; label: FileStatus }[] = [
  { match: "?", label: "untracked" },
  { match: "D", label: "deleted" },
  { match: "A", label: "added" },
  { match: "R", label: "renamed" },
];

function mapFileStatus(workingDir: string, index: string): FileStatus {
  for (const { match, label } of STATUS_PRIORITIES) {
    if (workingDir === match || index === match) return label;
  }
  return "modified";
}
