import type {
  AgentRole,
  AgentEvent,
  AgentEventCallback,
  WorkflowEvent,
  WorkflowEventCallback,
} from "../../types.js";
import type { DispatchPlan } from "../pm-dispatcher.js";

/**
 * Centralized event bus for agent and workflow events.
 *
 * Single Responsibility: listener management and event emission.
 * All event-shaping helpers (emitPM, emitTaskStatus, emitDispatchPlan)
 * live here so the rest of the system emits domain-level calls.
 */
export class EventBus {
  private agentListeners: AgentEventCallback[] = [];
  private workflowListeners: WorkflowEventCallback[] = [];

  /* ── Subscriptions ── */

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

  /* ── Core emitters ── */

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

  /* ── Domain helpers ── */

  /** Emit a PM activity event */
  emitPM(description: string): void {
    this.emitAgentEvent({
      type: "activity",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "activity", description },
    });
  }

  /** Emit a task status change event for the task tray */
  emitTaskStatus(
    taskId: string,
    status: "pending" | "running" | "done" | "error" | "skipped",
    title: string,
    role: AgentRole,
  ): void {
    this.emitAgentEvent({
      type: "task_status",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "task_status", taskId, status, title, role },
    });
  }

  /** Emit the full dispatch plan so the UI task tray updates */
  emitDispatchPlan(plan: DispatchPlan): void {
    this.emitAgentEvent({
      type: "dispatch_plan",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: {
        type: "dispatch_plan",
        plan: {
          mode: plan.mode,
          summary: plan.summary,
          tasks: plan.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            role: t.role,
            dependsOn: t.dependsOn,
            model: t.model,
            reviewLevel: t.reviewLevel,
          })),
        },
      },
    });
  }
}
