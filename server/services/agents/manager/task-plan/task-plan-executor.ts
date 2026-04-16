import type { AgentExecuteOptions } from "../../base/index.js";
import { takeSnapshot, computeChanges } from "../../utils/change-tracker.js";
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
 * Orchestrates the serial execution of a PM-dispatched task plan.
 *
 * Single Responsibility: task-level orchestration — dependency checking,
 * sequencing, cancellation, and delegation to collaborators.
 *
 * Dependency Inversion: depends on abstractions (IAgentExecutor, IEventEmitter,
 * IQualityGate, ICancellationToken), not on AgentManager directly.
 *
 * Each concern is handled by a focused collaborator:
 * - ExecutionFactory  — creates execution records for skipped/failed tasks
 * - TaskContextBuilder — builds prompt context and executes individual tasks
 * - TaskReplanner     — adaptive re-planning after spec-producing roles
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

  /**
   * Execute all tasks serially with dependency checking, quality gates,
   * artifact handoffs, and adaptive re-planning.
   */
  async execute(
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
  ): Promise<AgentExecution[]> {
    const executions: AgentExecution[] = [];
    const completed = new Map<string, AgentExecution>();
    const artifactPaths = new Map<string, string>();
    const pipelineSessions = new Map<AgentRole, string>();

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // ── Cancellation check ──
      if (this.cancellation.isCancelled()) {
        executions.push(
          ...this.factory.skipRemaining(tasks, completed, "Cancelled by user"),
        );
        break;
      }

      // ── Dependency check ──
      if (this.hasDependencyFailure(task, completed)) {
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
        completed.set(task.id, skipped);
        executions.push(skipped);
        continue;
      }

      // ── Execute ──
      this.emitter.emitPM(
        `Assigning task ${i + 1}/${tasks.length}: "${task.title}" → ${task.role}`,
      );
      this.emitter.emitTaskStatus(task.id, "running", task.title, task.role);

      try {
        // Snapshot BEFORE execution so the quality gate can diff what changed
        const preSnapshot = needsQualityGate(task.role, task.reviewLevel)
          ? takeSnapshot(baseOptions.projectRoot)
          : null;

        const execution = await this.runTask(
          task,
          tasks,
          baseOptions,
          completed,
          artifactPaths,
          pipelineSessions,
        );
        execution.taskId = task.id;
        executions.push(execution);
        completed.set(task.id, execution);

        if (execution.status !== "done") {
          // ── Task failed — cascade skip ──
          this.emitter.emitTaskStatus(
            task.id,
            "error",
            task.title,
            task.role,
          );
          this.emitter.emitPM(
            `${task.role} failed "${task.title}": ${execution.error ?? "unknown error"}`,
          );
          this.emitter.emitPM("Stopping remaining tasks due to failure");
          executions.push(
            ...this.factory.skipRemaining(
              tasks,
              completed,
              `Skipped: "${task.title}" failed`,
            ),
          );
          break;
        }

        // ── Task succeeded — post-processing ──
        await this.onTaskCompleted(
          task,
          i,
          execution,
          tasks,
          baseOptions,
          artifacts,
          completed,
          artifactPaths,
          executions,
          preSnapshot,
        );
      } catch (err: any) {
        // ── Task crashed — cascade skip ──
        this.emitter.emitTaskStatus(task.id, "error", task.title, task.role);
        this.emitter.emitPM(
          `${task.role} crashed on "${task.title}": ${err.message}`,
        );
        this.emitter.emitPM("Stopping remaining tasks due to crash");

        const failed = this.factory.createFailed(
          task.role,
          task.prompt,
          err.message,
        );
        completed.set(task.id, failed);
        executions.push(failed);
        executions.push(
          ...this.factory.skipRemaining(
            tasks,
            completed,
            `Skipped: "${task.title}" crashed`,
          ),
        );
        break;
      }
    }

    return executions;
  }

  /**
   * Refine, snapshot, and execute a single task.
   */
  private async runTask(
    task: DispatchTask,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    completed: Map<string, AgentExecution>,
    artifactPaths: Map<string, string>,
    pipelineSessions: Map<AgentRole, string>,
  ): Promise<AgentExecution> {
    // Two-phase PM: refine task prompts using artifacts from completed tasks
    const refinedTask = await this.maybeRefineTask(
      task,
      tasks,
      baseOptions,
      completed,
      artifactPaths,
      pipelineSessions,
    );

    return this.contextBuilder.executeWithContext(
      refinedTask,
      baseOptions,
      completed,
      artifactPaths,
      pipelineSessions,
      tasks,
    );
  }

  /**
   * Post-completion: write artifacts, run quality gate, attempt re-plan.
   */
  private async onTaskCompleted(
    task: DispatchTask,
    index: number,
    execution: AgentExecution,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    artifacts: ArtifactManager,
    completed: Map<string, AgentExecution>,
    artifactPaths: Map<string, string>,
    executions: AgentExecution[],
    preSnapshot: import("../../utils/change-tracker.js").ChangeSnapshot | null,
  ): Promise<void> {
    // Write artifact
    if (execution.responseText.trim()) {
      try {
        const artifactPath = artifacts.writeArtifact(
          task.role,
          task.id,
          task.title,
          execution.responseText,
        );
        artifactPaths.set(task.id, artifactPath);
        this.emitter.emitPM(`Artifact saved: ${artifactPath}`);
      } catch (err: any) {
        console.warn(
          `[task-plan-executor] Failed to write artifact for ${task.id}:`,
          err.message,
        );
      }
    }

    this.emitter.emitTaskStatus(task.id, "done", task.title, task.role);
    const cost =
      execution.costUsd > 0 ? ` ($${execution.costUsd.toFixed(4)})` : "";
    this.emitter.emitPM(
      `${task.role} completed "${task.title}"${cost} — marking done`,
    );

    // Quality gate (snapshot was taken before execution)
    if (!this.cancellation.isCancelled() && preSnapshot) {
      const changes = computeChanges(baseOptions.projectRoot, preSnapshot);
      const gateExecs = await this.qualityGate.run(
        task,
        { ...baseOptions, prompt: task.prompt },
        changes,
      );
      executions.push(...gateExecs);
    }

    // Adaptive re-planning
    await this.replanner.tryReplan(
      task,
      index,
      tasks,
      completed,
      artifactPaths.get(task.id),
      baseOptions,
    );

    // Progress announcement
    const nextTask = tasks[index + 1];
    if (nextTask) {
      this.emitter.emitPM(
        `Moving to next task: "${nextTask.title}" → ${nextTask.role}`,
      );
    } else {
      this.emitter.emitPM("All tasks completed");
    }
  }

  private hasDependencyFailure(
    task: DispatchTask,
    completed: Map<string, AgentExecution>,
  ): boolean {
    return task.dependsOn.some((dep) => {
      const depExec = completed.get(dep);
      return !depExec || depExec.status === "error";
    });
  }

  private async maybeRefineTask(
    task: DispatchTask,
    tasks: DispatchTask[],
    baseOptions: AgentExecuteOptions,
    completed: Map<string, AgentExecution>,
    artifactPaths: Map<string, string>,
    pipelineSessions: Map<AgentRole, string>,
  ): Promise<DispatchTask> {
    const isFirstForRole = !pipelineSessions.has(task.role);
    if (!isFirstForRole || artifactPaths.size === 0 || this.cancellation.isCancelled()) {
      return task;
    }

    const summaries = Array.from(artifactPaths.entries()).map(
      ([taskId, path]) => {
        const exec = completed.get(taskId);
        return {
          role: exec?.agentId ?? "unknown",
          artifactPath: path,
          title: tasks.find((t) => t.id === taskId)?.title ?? taskId,
        };
      },
    );

    const refinedPrompt = await refineTaskPrompt(
      task,
      summaries,
      baseOptions,
      (event: AgentEvent) => this.emitter.emitAgentEvent(event),
    );

    return { ...task, prompt: refinedPrompt };
  }
}

