import type { DefaultLogFields, ListLogLine } from "simple-git";
import { EMPTY_TREE_HASH } from "../constants.js";
import { DiffFormatter } from "../diff-formatter.js";
import type { GitEventBus } from "../event-bus.js";
import type { IGitClient } from "../git-client.js";
import type { CommitDetail, CommitEntry, CommitFile } from "../types.js";

/**
 * Create commits and read commit history.
 *
 * Single Responsibility: the commit lifecycle on the local repo.
 * Emits a status change via the event bus after writes so the UI refreshes.
 */
export class CommitService {
  constructor(
    private readonly client: IGitClient,
    private readonly bus: GitEventBus,
  ) {}

  async commit(
    projectPath: string,
    message: string,
    files?: string[],
  ): Promise<string> {
    const git = this.client.of(projectPath);

    if (files && files.length > 0) {
      await git.add(files);
    } else {
      await git.add(".");
    }

    const result = await git.commit(message);
    this.bus.emitStatusChange(projectPath);
    return result.commit;
  }

  async getHistory(projectPath: string, limit = 50): Promise<CommitEntry[]> {
    const git = this.client.of(projectPath);

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
    const git = this.client.of(projectPath);

    const logRaw = await git.raw([
      "log",
      "-1",
      "--format=%H%n%s%n%an%n%aI",
      hash,
    ]);
    const [fullHash, message, author, date] = logRaw.trim().split("\n");
    if (!fullHash) throw new Error(`Commit ${hash} not found`);

    // Commits without a parent (root commits) diff against the empty tree.
    const parentRaw = await git.raw(["rev-parse", `${hash}^`]).catch(() => "");
    const parent = parentRaw.trim() || EMPTY_TREE_HASH;

    const [rawDiff, numstatRaw] = await Promise.all([
      git.raw(["diff", parent, hash]),
      git.raw(["diff", "--numstat", parent, hash]),
    ]);

    const files: CommitFile[] = numstatRaw
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

    return {
      hash: fullHash,
      message,
      author,
      date,
      files,
      diff: DiffFormatter.cap(rawDiff, "too large to display"),
    };
  }
}
