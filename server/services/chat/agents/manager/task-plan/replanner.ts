import type { AgentExecuteOptions } from "../../base/index.js";
import type { AgentRole, AgentEvent } from "../../types.js";
import { replanDownstream, type DispatchTask } from "../pm-dispatcher/index.js";
import type { PMLifecycleHook } from "../pm-dispatcher/pm-runner.js";
import type { IEventEmitter, ICancellationToken } from "./types.js";

/** Roles whose completion triggers downstream re-planning */
const DEFAULT_REPLAN_TRIGGERS = new Set<string>([
  "ui-designer",
  "architect",
  "database-engineer",
]);

/**
 * Manages adaptive re-planning after spec-producing roles complete.
 *
 * Single Responsibility: deciding when to re-plan and splicing new tasks.
 * Open/Closed: the trigger set can be extended via constructor without
 * modifying the class.
 */
export class TaskReplanner {
  /** Tracks which spec-producing roles have already triggered a re-plan */
  private readonly triggered = new Set<AgentRole>();

  constructor(
    private readonly emitter: IEventEmitter,
    private readonly cancellation: ICancellationToken,
    private readonly pmLifecycle?: PMLifecycleHook,
    private readonly replanTriggers: Set<string> = DEFAULT_REPLAN_TRIGGERS,
  ) {}

  /**
   * Attempt to re-plan downstream tasks after a completed task.
   * Mutates the `tasks` array in-place if re-planning produces new tasks.
   * Returns true if the task list was modified.
   */
  async tryReplan(
    completedTask: DispatchTask,
    completedIndex: number,
    tasks: DispatchTask[],
    completed: Map<string, unknown>,
    artifactPath: string | undefined,
    baseOptions: AgentExecuteOptions,
  ): Promise<boolean> {
    if (!this.shouldReplan(completedTask, artifactPath)) return false;

    const remainingTasks = tasks
      .slice(completedIndex + 1)
      .filter((t) => !completed.has(t.id));

    if (remainingTasks.length === 0) return false;

    try {
      const newTasks = await replanDownstream(
        completedTask,
        artifactPath!,
        remainingTasks,
        baseOptions,
        (event: AgentEvent) => this.emitter.emitAgentEvent(event),
        this.pmLifecycle,
      );

      if (newTasks === remainingTasks || newTasks.length === 0) return false;

      // Splice the new tasks into the mutable array
      tasks.splice(
        completedIndex + 1,
        tasks.length - completedIndex - 1,
        ...newTasks,
      );
      this.triggered.add(completedTask.role);

      // Emit updated plan so UI refreshes the task tray
      this.emitter.emitAgentEvent({
        type: "dispatch_plan",
        agentId: "product-manager",
        executionId: "",
        timestamp: new Date().toISOString(),
        data: {
          type: "dispatch_plan",
          plan: {
            mode: "multi" as const,
            summary: `Re-planned: ${newTasks.length} tasks after ${completedTask.role} completed`,
            tasks: tasks.map((t) => ({
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

      this.emitter.emitPM(
        `Re-planned pipeline: ${remainingTasks.length} → ${newTasks.length} tasks`,
      );
      return true;
    } catch (err: any) {
      console.warn(
        `[task-replanner] Re-plan failed, continuing with original tasks:`,
        err.message,
      );
      return false;
    }
  }

  private shouldReplan(
    task: DispatchTask,
    artifactPath: string | undefined,
  ): boolean {
    return (
      this.replanTriggers.has(task.role) &&
      !this.triggered.has(task.role) &&
      !this.cancellation.isCancelled() &&
      !!artifactPath
    );
  }
}
