import type { AgentExecuteOptions } from "../../base/index.js";
import type { ChangeSet } from "../../utils/change-tracker.js";
import type { AgentRole, AgentExecution, AgentEvent } from "../../types.js";
import type { DispatchTask, ReviewLevel } from "../pm-dispatcher/index.js";

/* ── Interface Segregation: each collaborator depends only on what it needs ── */

/** Executes a single agent with a given role */
export interface IAgentExecutor {
  execute(
    opts: AgentExecuteOptions & { role?: AgentRole },
  ): Promise<AgentExecution>;
}

/** Emits events to the UI layer */
export interface IEventEmitter {
  emitAgentEvent(event: AgentEvent): void;
  emitPM(description: string): void;
  emitTaskStatus(
    taskId: string,
    status: "pending" | "running" | "done" | "error" | "skipped",
    title: string,
    role: AgentRole,
  ): void;
}

/** Runs the quality gate on completed work */
export interface IQualityGate {
  run(
    context: {
      role: AgentRole;
      prompt: string;
      title: string;
      reviewLevel?: ReviewLevel;
    },
    options: AgentExecuteOptions,
    changes?: ChangeSet,
  ): Promise<AgentExecution[]>;
}

/** Checks whether execution has been cancelled */
export interface ICancellationToken {
  isCancelled(): boolean;
}

/**
 * Combined dependencies injected into the TaskPlanExecutor.
 * Composes the segregated interfaces into a single injection point
 * so the AgentManager can pass `this` without adapters.
 */
export interface TaskPlanDeps
  extends IAgentExecutor,
    IEventEmitter,
    IQualityGate,
    ICancellationToken {
  /** Alias — IQualityGate.run wired through here for convenience */
  run: IQualityGate["run"];
}

/** Snapshot of pipeline state passed between internal collaborators */
export interface PipelineState {
  /** All task executions collected so far */
  readonly executions: AgentExecution[];
  /** Completed task executions keyed by task ID */
  readonly completed: Map<string, AgentExecution>;
  /** Maps taskId → project-relative artifact path */
  readonly artifactPaths: Map<string, string>;
  /** Tracks which roles have already executed in THIS pipeline */
  readonly pipelineSessions: Map<AgentRole, string>;
  /** The mutable task list (may be spliced by re-planning) */
  readonly tasks: DispatchTask[];
}
