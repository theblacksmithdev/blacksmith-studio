import type { GitEventBus } from "../event-bus.js";
import type { GitClient } from "../git-client.js";
import type { BranchInfo } from "../types.js";

export interface MergeResult {
  success: boolean;
  conflicts: string[];
}

/**
 * Branch listing, creation, switching, and merging.
 *
 * Single Responsibility: branch-level operations on the local repo.
 * Emits a status change after any write so the UI refreshes.
 */
export class BranchService {
  constructor(
    private readonly client: GitClient,
    private readonly bus: GitEventBus,
  ) {}

  async list(projectPath: string): Promise<BranchInfo[]> {
    const git = this.client.of(projectPath);
    const summary = await git.branchLocal();

    return summary.all.map((name) => ({
      name,
      current: name === summary.current,
      label: name,
    }));
  }

  async create(projectPath: string, name: string): Promise<void> {
    const git = this.client.of(projectPath);
    await git.checkoutLocalBranch(name);
    this.bus.emitStatusChange(projectPath);
  }

  async switch(projectPath: string, name: string): Promise<void> {
    const git = this.client.of(projectPath);
    await git.checkout(name);
    this.bus.emitStatusChange(projectPath);
  }

  async merge(
    projectPath: string,
    source: string,
    target: string,
  ): Promise<MergeResult> {
    const git = this.client.of(projectPath);

    await git.checkout(target);

    try {
      await git.merge([source]);
      this.bus.emitStatusChange(projectPath);
      return { success: true, conflicts: [] };
    } catch {
      const status = await git.status();
      return { success: false, conflicts: status.conflicted };
    }
  }
}
