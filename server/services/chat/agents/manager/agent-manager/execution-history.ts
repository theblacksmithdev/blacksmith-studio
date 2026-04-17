import type { AgentExecution } from "../../types.js";

/**
 * Bounded in-memory history of agent executions.
 *
 * Single Responsibility: remembering the last N executions for read-back
 * via the UI/IPC layer. Eviction is FIFO on capacity overflow.
 */
export class ExecutionHistory {
  private readonly entries: AgentExecution[] = [];

  constructor(private readonly capacity = 200) {}

  push(execution: AgentExecution): void {
    this.entries.push(execution);
    if (this.entries.length > this.capacity) {
      this.entries.splice(0, this.entries.length - this.capacity);
    }
  }

  tail(limit = 50): AgentExecution[] {
    return this.entries.slice(-limit);
  }
}
