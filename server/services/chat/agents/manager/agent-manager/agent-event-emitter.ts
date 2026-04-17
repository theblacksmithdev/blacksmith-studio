import type { AgentRole, AgentEvent } from "../../types.js";
import type { DispatchPlan } from "../pm-dispatcher/index.js";
import type { IEventEmitter } from "../task-plan/types.js";
import type { EventBus } from "./event-bus.js";

/**
 * Domain-level agent event emitter.
 *
 * Single Responsibility: shape high-level concepts (PM activity, task status,
 * dispatch plan) into AgentEvent envelopes and hand them to the EventBus.
 * Keeps the bus itself free of domain knowledge.
 *
 * Implements IEventEmitter so task-plan collaborators can depend on the
 * interface rather than this concrete class.
 */
export class AgentEventEmitter implements IEventEmitter {
  constructor(private readonly bus: EventBus) {}

  emitAgentEvent(event: AgentEvent): void {
    this.bus.emitAgentEvent(event);
  }

  /** PM activity message (status text shown under the PM agent) */
  emitPM(description: string): void {
    this.bus.emitAgentEvent({
      type: "activity",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "activity", description },
    });
  }

  /**
   * PM lifecycle status — flips the PM's UI state between executing / done
   * / error. The first PM text chunk sets "executing"; the dispatcher
   * resets to "done" (or "error") in a finally block so the spinner
   * clears even when downstream tasks fail.
   */
  emitPMStatus(
    status: "executing" | "done" | "error" | "idle",
    message?: string,
  ): void {
    this.bus.emitAgentEvent({
      type: "status",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "status", status, message },
    });
  }

  /** Task status change for the task tray */
  emitTaskStatus(
    taskId: string,
    status: "pending" | "running" | "done" | "error" | "skipped",
    title: string,
    role: AgentRole,
  ): void {
    this.bus.emitAgentEvent({
      type: "task_status",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: { type: "task_status", taskId, status, title, role },
    });
  }

  /** Full dispatch plan so the UI task tray updates */
  emitDispatchPlan(plan: DispatchPlan): void {
    this.bus.emitAgentEvent({
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
