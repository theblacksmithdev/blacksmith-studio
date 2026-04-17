import type { GitEventBus } from "../event-bus.js";
import type { IGitClient } from "../git-client.js";

/**
 * Repository-level lifecycle operations.
 *
 * Single Responsibility: operations that change whether a repo exists
 * (today: `init`; future: clone, delete, archive).
 */
export class RepoLifecycleService {
  constructor(
    private readonly client: IGitClient,
    private readonly bus: GitEventBus,
  ) {}

  async init(projectPath: string): Promise<void> {
    const git = this.client.of(projectPath);
    await git.init();
    await git.add(".");
    await git.commit("Initial project setup");
    this.bus.emitStatusChange(projectPath);
  }
}
