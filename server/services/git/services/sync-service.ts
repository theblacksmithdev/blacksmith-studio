import type { GitEventBus } from "../event-bus.js";
import type { IGitClient } from "../git-client.js";

export interface SyncResult {
  success: boolean;
  error?: string;
}

/**
 * Push/pull against the configured remote.
 *
 * Single Responsibility: remote synchronisation. Always tries pull-then-push
 * and returns a result object — never throws, so the UI can surface errors
 * in-band.
 */
export class SyncService {
  constructor(
    private readonly client: IGitClient,
    private readonly bus: GitEventBus,
  ) {}

  async sync(projectPath: string): Promise<SyncResult> {
    const git = this.client.of(projectPath);

    try {
      const remotes = await git.getRemotes();
      if (remotes.length === 0) {
        return { success: false, error: "No remote configured" };
      }

      await git.pull({ "--rebase": "false" } as any);
      await git.push();
      this.bus.emitStatusChange(projectPath);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Sync failed" };
    }
  }
}
