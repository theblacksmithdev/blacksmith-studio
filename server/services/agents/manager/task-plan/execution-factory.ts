import crypto from "node:crypto";
import type { AgentRole, AgentExecution } from "../../types.js";
import type { DispatchTask } from "../pm-dispatcher/index.js";
import type { IEventEmitter } from "./types.js";

/**
 * Creates AgentExecution records for tasks that did not run
 * (cancelled, skipped due to dependency failure, or cascaded from a crash).
 *
 * Single Responsibility: execution record creation for non-happy-path tasks.
 * Eliminates the 5x duplication of the same 12-field struct.
 */
export class ExecutionFactory {
  constructor(private readonly emitter: IEventEmitter) {}

  /** Create a skipped execution and emit the UI status event */
  createSkipped(task: DispatchTask, reason: string): AgentExecution {
    this.emitter.emitTaskStatus(task.id, "skipped", task.title, task.role);
    return this.build(task.role, task.prompt, reason);
  }

  /** Create a failed execution for a task that threw */
  createFailed(role: AgentRole, prompt: string, error: string): AgentExecution {
    return this.build(role, prompt, error);
  }

  /** Mark all incomplete tasks in the list as skipped */
  skipRemaining(
    tasks: DispatchTask[],
    completed: Map<string, AgentExecution>,
    reason: string,
  ): AgentExecution[] {
    const skipped: AgentExecution[] = [];
    for (const task of tasks) {
      if (!completed.has(task.id)) {
        const exec = this.createSkipped(task, reason);
        completed.set(task.id, exec);
        skipped.push(exec);
      }
    }
    return skipped;
  }

  private build(
    role: AgentRole,
    prompt: string,
    error: string,
  ): AgentExecution {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      agentId: role,
      sessionId: "",
      status: "error",
      prompt,
      startedAt: now,
      completedAt: now,
      costUsd: 0,
      durationMs: 0,
      error,
      responseText: "",
    };
  }
}
