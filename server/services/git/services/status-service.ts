import type { SimpleGit, StatusResult } from "simple-git";
import type { IGitClient } from "../git-client.js";
import type {
  GitStatus,
  SyncResolution,
  SyncState,
  SyncStatus,
} from "../types.js";

/**
 * Repository status + remote sync state.
 *
 * Single Responsibility: classify the repo's current state. Owns the
 * sync-state resolution logic — the rest of the system consumes a
 * typed result, never the raw simple-git StatusResult.
 */
export class StatusService {
  constructor(private readonly client: IGitClient) {}

  async getStatus(projectPath: string): Promise<GitStatus> {
    const git = this.client.of(projectPath);

    try {
      if (!(await git.checkIsRepo())) return StatusService.empty();

      const status = await git.status();
      const sync = await this.resolveSync(git, status);

      return {
        initialized: true,
        branch: status.current ?? "HEAD",
        changedCount: status.files.length,
        syncStatus: sync.status,
        ahead: sync.ahead,
        behind: sync.behind,
      };
    } catch {
      return StatusService.empty();
    }
  }

  async getSyncStatus(projectPath: string): Promise<SyncStatus> {
    const git = this.client.of(projectPath);

    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0) return { ahead: 0, behind: 0, hasRemote: false };

      // Use cached tracking info rather than calling git fetch here — fetch
      // is a network call and would block for seconds. Fetch happens during
      // explicit sync instead.
      const status = await git.status();
      return { ahead: status.ahead, behind: status.behind, hasRemote: true };
    } catch {
      return { ahead: 0, behind: 0, hasRemote: false };
    }
  }

  /**
   * Classify the repo's remote-sync state. Uses a guard-clause chain so
   * adding a new state is a single additional case, not an edit to an
   * existing conditional.
   */
  private async resolveSync(
    git: SimpleGit,
    status: StatusResult,
  ): Promise<SyncResolution> {
    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0) return resolution("local-only", 0, 0);

      if (status.ahead > 0 && status.behind > 0)
        return resolution("diverged", status.ahead, status.behind);
      if (status.ahead > 0) return resolution("ahead", status.ahead, 0);
      if (status.behind > 0) return resolution("behind", 0, status.behind);
      return resolution("synced", 0, 0);
    } catch {
      return resolution("unknown", 0, 0);
    }
  }

  private static empty(): GitStatus {
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

function resolution(
  status: SyncState,
  ahead: number,
  behind: number,
): SyncResolution {
  return { status, ahead, behind };
}
