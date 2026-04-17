import type { AgentExecuteOptions } from "../../base/index.js";
import { takeSnapshot, computeChanges, type ChangeSnapshot } from "../../utils/change-tracker.js";
import type { AgentRole, AgentExecution, AgentEvent } from "../../types.js";
import type { ArtifactManager } from "../../artifacts.js";
import { refineTaskPrompt, type DispatchTask } from "../pm-dispatcher/index.js";
import { needsQualityGate } from "../quality-gate.js";
import type {
  IAgentExecutor,
  IEventEmitter,
  IQualityGate,
  ICancellationToken,
} from "./types.js";
import { ExecutionFactory } from "./execution-factory.js";
import { TaskContextBuilder } from "./context-builder.js";
import { TaskReplanner } from "./replanner.js";

/**
 * Orchestrates execution of a PM-dispatched task plan with **dependency-
 * aware parallelism**.
 *
 * Scheduling rules:
 * - A task is eligible to start once every `dependsOn` task has completed
 *   successfully.
 * - A role may have at most ONE task in flight at a time — agents resume
 *   their pipeline session, and the CLI can't safely concurrent-resume.
 * - At most ONE quality-gated task may be in flight at a time — the gate
 *   diffs the filesystem and concurrent writes would corrupt the snapshot.
 * - Spec/doc tasks (reviewLevel === "none") run freely in parallel with
 *   each other and with one code-producing task.
 * - On failure, no new tasks start; in-flight tasks are allowed to finish;
 *   anything that still hasn't started is skipped.
 *
 * Collaborators:
 * - ExecutionFactory   — execution records for skipped/failed tasks
 * - TaskContextBuilder — prompt context + per-task execution
 * - TaskReplanner      — adaptive re-planning (fires only if no downstream
 *                        task has already started)
 */
export class TaskPlanExecutor {
  private readonly factory: ExecutionFactory;
  private readonly contextBuilder: TaskContextBuilder;
  private readonly replanner: TaskReplanner;

  constructor(
    executor: IAgentExecutor,
    private readonly emitter: IEventEmitter,
    private readonly qualityGate: IQualityGate,
    private readonly cancellation: ICancellationToken,
  ) {
    this.factory = new ExecutionFactory(emitter);
    this.contextBuilder = new TaskContextBuilder(executor);
    this.replanner = new TaskReplanner(emitter, cancellation);
  }

  async execute(
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
  ): Promise<AgentExecution[]> {
    const state: PipelineState = {
      executions: [],
      completed: new Map(),
      artifactPaths: new Map(),
      pipelineSessions: new Map(),
      started: new Set(),
      busyRoles: new Set(),
      qualityGateBusy: false,
      stoppedForFailure: false,
    };

    let wake: (() => void) | null = null;
    const nextEvent = () => new Promise<void>((r) => { wake = r; });
    const notifyLoopTick = () => {
      const fn = wake;
      wake = null;
      fn?.();
    };

    const inFlight = new Map<string, Promise<void>>();

    while (state.completed.size < tasks.length) {
      if (this.cancellation.isCancelled()) {
        await Promise.allSettled(inFlight.values());
        state.executions.push(
          ...this.factory.skipRemaining(tasks, state.completed, "Cancelled by user"),
        );
        break;
      }

      this.skipDependencyFailures(tasks, state);

      const started = this.startReadyTasks(
        tasks,
        state,
        baseOptions,
        artifacts,
        inFlight,
        notifyLoopTick,
      );

      if (inFlight.size === 0) {
        // No running work AND no new starts — either every task is done,
        // or the remaining ones are unreachable (should not happen with
        // a valid plan, but guard anyway).
        if (state.completed.size < tasks.length) {
          state.executions.push(
            ...this.factory.skipRemaining(
              tasks,
              state.completed,
              state.stoppedForFailure
                ? "Skipped: pipeline stopped after failure"
                : "Unreachable dependency graph",
            ),
          );
        }
        break;
      }

      if (!started) {
        // At least one task is in flight but we couldn't start anything
        // new this pass — wait for the next completion.
        await nextEvent();
      }
    }

    return state.executions;
  }

  /** Mark tasks whose deps failed as skipped. */
  private skipDependencyFailures(
    tasks: DispatchTask[],
    state: PipelineState,
  ): void {
    for (const task of tasks) {
      if (state.started.has(task.id) || state.completed.has(task.id)) continue;
      if (!this.hasDependencyFailure(task, state.completed)) continue;

      this.emitter.emitAgentEvent({
        type: "error",
        agentId: task.role,
        executionId: "",
        timestamp: new Date().toISOString(),
        data: {
          type: "error",
          error: `Skipped "${task.title}": dependency not met`,
          recoverable: false,
        },
      });
      const skipped = this.factory.createSkipped(task, "Dependency not met");
      state.started.add(task.id);
      state.completed.set(task.id, skipped);
      state.executions.push(skipped);
    }
  }

  /**
   * Start every task whose deps are satisfied and whose role/QG slot is free.
   * Returns true if at least one task was started this pass.
   */
  private startReadyTasks(
    tasks: DispatchTask[],
    state: PipelineState,
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
    inFlight: Map<string, Promise<void>>,
    onSettle: () => void,
  ): boolean {
    if (state.stoppedForFailure) return false;

    let startedThisPass = false;
    for (const task of tasks) {
      if (state.started.has(task.id)) continue;
      if (!this.allDepsDone(task, state.completed)) continue;
      if (state.busyRoles.has(task.role)) continue;

      const requiresQg = needsQualityGate(task.role, task.reviewLevel);
      if (requiresQg && state.qualityGateBusy) continue;

      state.started.add(task.id);
      state.busyRoles.add(task.role);
      if (requiresQg) state.qualityGateBusy = true;
      startedThisPass = true;

      const promise = this.runOne(task, tasks, baseOptions, artifacts, state)
        .catch((err) => {
          console.warn("[task-plan-executor] runOne rejected:", err);
        })
        .finally(() => {
          inFlight.delete(task.id);
          state.busyRoles.delete(task.role);
          if (requiresQg) state.qualityGateBusy = false;
          const exec = state.completed.get(task.id);
          if (!exec || exec.status !== "done") {
            state.stoppedForFailure = true;
          }
          onSettle();
        });
      inFlight.set(task.id, promise);
    }
    return startedThisPass;
  }

  /**
   * Run a single task end-to-end: emit status, refine + execute, handle
   * failure/crash, and on success run post-processing (artifact, quality
   * gate, replan).
   */
  private async runOne(
    task: DispatchTask,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
    state: PipelineState,
  ): Promise<void> {
    const completedCount = this.countCompleted(state);
    this.emitter.emitPM(
      `Assigning task ${completedCount + 1}/${tasks.length}: "${task.title}" → ${task.role}`,
    );
    this.emitter.emitTaskStatus(task.id, "running", task.title, task.role);

    try {
      const preSnapshot = needsQualityGate(task.role, task.reviewLevel)
        ? takeSnapshot(baseOptions.projectRoot)
        : null;

      const execution = await this.runTask(task, tasks, baseOptions, state);
      execution.taskId = task.id;
      state.executions.push(execution);
      state.completed.set(task.id, execution);

      if (execution.status !== "done") {
        this.emitter.emitTaskStatus(task.id, "error", task.title, task.role);
        this.emitter.emitPM(
          `${task.role} failed "${task.title}": ${execution.error ?? "unknown error"}`,
        );
        this.emitter.emitPM("Stopping remaining tasks due to failure");
        return;
      }

      await this.onTaskCompleted(task, execution, tasks, baseOptions, artifacts, state, preSnapshot);
    } catch (err: any) {
      this.emitter.emitTaskStatus(task.id, "error", task.title, task.role);
      this.emitter.emitPM(
        `${task.role} crashed on "${task.title}": ${err.message}`,
      );
      this.emitter.emitPM("Stopping remaining tasks due to crash");

      const failed = this.factory.createFailed(task.role, task.prompt, err.message);
      state.completed.set(task.id, failed);
      state.executions.push(failed);
    }
  }

  /** Refine (maybe) + execute a single task with its contextual preamble. */
  private async runTask(
    task: DispatchTask,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    state: PipelineState,
  ): Promise<AgentExecution> {
    const refinedTask = await this.maybeRefineTask(task, tasks, baseOptions, state);
    return this.contextBuilder.executeWithContext(
      refinedTask,
      baseOptions,
      state.completed,
      state.artifactPaths,
      state.pipelineSessions,
      tasks,
    );
  }

  /** Post-completion: write artifact, quality gate, replan. */
  private async onTaskCompleted(
    task: DispatchTask,
    execution: AgentExecution,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
    state: PipelineState,
    preSnapshot: ChangeSnapshot | null,
  ): Promise<void> {
    if (execution.responseText.trim()) {
      try {
        const artifactPath = artifacts.writeArtifact(
          task.role,
          task.id,
          task.title,
          execution.responseText,
        );
        state.artifactPaths.set(task.id, artifactPath);
        this.emitter.emitPM(`Artifact saved: ${artifactPath}`);
      } catch (err: any) {
        console.warn(
          `[task-plan-executor] Failed to write artifact for ${task.id}:`,
          err.message,
        );
      }
    }

    this.emitter.emitTaskStatus(task.id, "done", task.title, task.role);
    const cost = execution.costUsd > 0 ? ` ($${execution.costUsd.toFixed(4)})` : "";
    this.emitter.emitPM(
      `${task.role} completed "${task.title}"${cost} — marking done`,
    );

    if (!this.cancellation.isCancelled() && preSnapshot) {
      const changes = computeChanges(baseOptions.projectRoot, preSnapshot);
      const gateExecs = await this.qualityGate.run(
        task,
        { ...baseOptions, prompt: task.prompt },
        changes,
      );
      state.executions.push(...gateExecs);
    }

    // Replan only if no downstream task has already started. Once a
    // dependent task is in flight or complete, mutating the plan around
    // it would be incoherent.
    const anyDownstreamStarted = tasks.some(
      (t) => t.dependsOn.includes(task.id) && state.started.has(t.id),
    );
    if (!anyDownstreamStarted) {
      const completedIndex = tasks.findIndex((t) => t.id === task.id);
      await this.replanner.tryReplan(
        task,
        completedIndex,
        tasks,
        state.completed,
        state.artifactPaths.get(task.id),
        baseOptions,
      );
    }
  }

  private allDepsDone(
    task: DispatchTask,
    completed: Map<string, AgentExecution>,
  ): boolean {
    return task.dependsOn.every((dep) => completed.get(dep)?.status === "done");
  }

  private hasDependencyFailure(
    task: DispatchTask,
    completed: Map<string, AgentExecution>,
  ): boolean {
    return task.dependsOn.some((dep) => {
      const depExec = completed.get(dep);
      return depExec !== undefined && depExec.status !== "done";
    });
  }

  private countCompleted(state: PipelineState): number {
    let n = 0;
    for (const exec of state.completed.values()) {
      if (exec.status === "done") n++;
    }
    return n;
  }

  private async maybeRefineTask(
    task: DispatchTask,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    state: PipelineState,
  ): Promise<DispatchTask> {
    const isFirstForRole = !state.pipelineSessions.has(task.role);
    if (!isFirstForRole || state.artifactPaths.size === 0 || this.cancellation.isCancelled()) {
      return task;
    }

    const summaries = Array.from(state.artifactPaths.entries()).map(
      ([taskId, path]) => {
        const exec = state.completed.get(taskId);
        return {
          role: exec?.agentId ?? "unknown",
          artifactPath: path,
          title: tasks.find((t) => t.id === taskId)?.title ?? taskId,
        };
      },
    );

    // Skip the refinement round-trip when the PM already produced a prompt
    // that explicitly references every available artifact path. The extra
    // Claude call adds ~3-5s per role with no material benefit.
    if (promptCoversArtifacts(task.prompt, summaries)) {
      return task;
    }

    const refinedPrompt = await refineTaskPrompt(
      task,
      summaries,
      baseOptions,
      (event: AgentEvent) => this.emitter.emitAgentEvent(event),
    );

    return { ...task, prompt: refinedPrompt };
  }
}

/** Mutable state carried through the scheduler loop. */
interface PipelineState {
  executions: AgentExecution[];
  completed: Map<string, AgentExecution>;
  artifactPaths: Map<string, string>;
  pipelineSessions: Map<AgentRole, string>;
  started: Set<string>;
  busyRoles: Set<AgentRole>;
  qualityGateBusy: boolean;
  stoppedForFailure: boolean;
}

/**
 * True when the prompt already names every artifact path we'd feed to the
 * refiner. False negatives are fine; false positives only occur when the
 * prompt literally contains every artifact path, which already meets the
 * specificity bar refinement was trying to produce.
 */
function promptCoversArtifacts(
  prompt: string,
  summaries: { artifactPath: string }[],
): boolean {
  if (summaries.length === 0) return true;
  return summaries.every((s) => prompt.includes(s.artifactPath));
}
