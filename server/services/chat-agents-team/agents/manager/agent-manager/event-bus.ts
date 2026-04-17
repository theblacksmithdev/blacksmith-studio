import type {
  AgentEvent,
  AgentEventCallback,
  WorkflowEvent,
  WorkflowEventCallback,
} from "../../types.js";

/**
 * Low-level pub/sub for agent and workflow events.
 *
 * Single Responsibility: listener management and event fan-out.
 * Domain-shaped emission helpers (PM activity, task status, dispatch plan)
 * live in AgentEventEmitter, which composes this bus.
 */
export class EventBus {
  private agentListeners: AgentEventCallback[] = [];
  private workflowListeners: WorkflowEventCallback[] = [];

  onAgentEvent(cb: AgentEventCallback): () => void {
    this.agentListeners.push(cb);
    return () => {
      this.agentListeners = this.agentListeners.filter((l) => l !== cb);
    };
  }

  onWorkflowEvent(cb: WorkflowEventCallback): () => void {
    this.workflowListeners.push(cb);
    return () => {
      this.workflowListeners = this.workflowListeners.filter((l) => l !== cb);
    };
  }

  emitAgentEvent(event: AgentEvent): void {
    for (const cb of this.agentListeners) {
      try {
        cb(event);
      } catch (err) {
        console.error("[event-bus] Agent event listener error:", err);
      }
    }
  }

  emitWorkflowEvent(event: WorkflowEvent): void {
    for (const cb of this.workflowListeners) {
      try {
        cb(event);
      } catch (err) {
        console.error("[event-bus] Workflow event listener error:", err);
      }
    }
  }
}
