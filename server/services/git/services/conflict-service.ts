import type { GitEventBus } from "../event-bus.js";
import type { GitClient } from "../git-client.js";
import type { ConflictFile } from "../types.js";

export type ConflictResolution = "ours" | "theirs";

/**
 * List and resolve merge conflicts.
 *
 * Single Responsibility: conflict-state operations. Resolution uses
 * `git checkout --ours/--theirs` + stage, which is the standard flow
 * for programmatic resolution.
 */
export class ConflictService {
  constructor(
    private readonly client: GitClient,
    private readonly bus: GitEventBus,
  ) {}

  async list(projectPath: string): Promise<ConflictFile[]> {
    const git = this.client.of(projectPath);
    const status = await git.status();
    return status.conflicted.map((path) => ({ path }));
  }

  async resolve(
    projectPath: string,
    filePath: string,
    resolution: ConflictResolution,
  ): Promise<void> {
    const git = this.client.of(projectPath);
    const flag = resolution === "ours" ? "--ours" : "--theirs";

    await git.raw(["checkout", flag, "--", filePath]);
    await git.add(filePath);
    this.bus.emitStatusChange(projectPath);
  }
}
