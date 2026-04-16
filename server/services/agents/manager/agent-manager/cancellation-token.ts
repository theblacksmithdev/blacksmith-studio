import type { ICancellationToken } from "../task-plan/types.js";

/**
 * Value object representing cancellable state for a dispatch run.
 *
 * Satisfies ICancellationToken so collaborators that only need to *check*
 * cancellation can depend on the interface, while the owner (AgentManager)
 * can trigger and reset it.
 */
export class CancellationToken implements ICancellationToken {
  private cancelled = false;

  isCancelled(): boolean {
    return this.cancelled;
  }

  cancel(): void {
    this.cancelled = true;
  }

  reset(): void {
    this.cancelled = false;
  }
}
