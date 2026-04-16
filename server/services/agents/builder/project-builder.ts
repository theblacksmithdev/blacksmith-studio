import crypto from "node:crypto";
import type { AgentManager } from "../manager/agent-manager/index.js";
import type { AgentExecuteOptions } from "../base/index.js";
import type { AgentRole } from "../types.js";
import type {
  BuildPlan,
  BuildPhase,
  BuildTask,
  BuildProgress,
  BuildTaskResult,
  BuildEvent,
  BuildEventCallback,
} from "./types.js";
import { generatePlan } from "./planner.js";
import { runVerification } from "./verification.js";
import {
  saveCheckpoint,
  loadCheckpoint,
  deleteCheckpoint,
} from "./checkpoint.js";
import { capturePhaseSnapshot } from "./snapshot.js";
import { HumanInputGate } from "./human-input.js";

const MAX_TASK_RETRIES = 2;

/**
 * ProjectBuilder — orchestrates building an entire application from requirements.
 *
 * Human-in-the-loop integration points:
 * - **Plan approval**: After generating the plan, pauses for user review before executing.
 * - **Phase gate**: After each phase completes, asks whether to continue.
 * - **Verification failure**: When type checks or Django checks fail, asks how to proceed.
 * - **Task failure**: When a task fails after retries, asks whether to retry/skip/abort.
 * - **Clarification**: Agents can surface ambiguities that get routed to the user.
 *
 * Set `humanInput.autoApprove = true` for fully autonomous builds (no pauses).
 */
export class ProjectBuilder {
  private manager: AgentManager;
  private listeners: BuildEventCallback[] = [];
  private activeBuild: BuildProgress | null = null;
  private cancelled = false;
  private roleSessions = new Map<AgentRole, string>();

  /** Human input gate — attach UI listeners here to receive questions */
  readonly humanInput: HumanInputGate;

  constructor(manager: AgentManager) {
    this.manager = manager;
    this.humanInput = new HumanInputGate();
  }

  get isBuilding(): boolean {
    return this.activeBuild !== null;
  }

  get progress(): BuildProgress | null {
    return this.activeBuild;
  }

  onEvent(cb: BuildEventCallback): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  /** Build an entire application from requirements. */
  async build(
    requirements: string,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<BuildProgress> {
    if (this.activeBuild) throw new Error("A build is already in progress");

    this.cancelled = false;
    this.roleSessions.clear();
    this.humanInput.reset();
    const buildId = crypto.randomUUID();
    const now = new Date().toISOString();

    // ── 1. Plan ──
    this.emit({
      type: "build:plan_started",
      buildId,
      timestamp: now,
      data: { message: "Analyzing requirements and generating build plan..." },
    });

    let plan: BuildPlan;
    try {
      plan = await generatePlan(requirements, baseOptions);
    } catch (err: any) {
      this.emit({
        type: "build:failed",
        buildId,
        timestamp: new Date().toISOString(),
        data: { message: `Planning failed: ${err.message}` },
      });
      throw err;
    }

    this.emit({
      type: "build:plan_ready",
      buildId,
      timestamp: new Date().toISOString(),
      data: {
        message: `Plan ready: ${plan.phases.length} phases, ${plan.totalTasks} tasks`,
        plan,
      },
    });

    // ── 2. Human approval of the plan ──
    const planSummary = this.formatPlanForReview(plan);
    const approved = await this.humanInput.approvePlan(buildId, planSummary);

    if (!approved) {
      this.emit({
        type: "build:cancelled",
        buildId,
        timestamp: new Date().toISOString(),
        data: { message: "Build plan rejected by user" },
      });
      return this.initProgress(buildId, plan, now);
    }

    // ── 3. Execute ──
    const progress = this.initProgress(buildId, plan, now);
    this.activeBuild = progress;
    await this.runBuild(progress, baseOptions, maxBudgetUsd);
    return progress;
  }

  /** Resume a previously checkpointed build. */
  async resume(
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<BuildProgress> {
    if (this.activeBuild) throw new Error("A build is already in progress");

    const checkpoint = loadCheckpoint(baseOptions.projectRoot);
    if (!checkpoint)
      throw new Error("No build checkpoint found. Start a new build instead.");

    this.cancelled = false;
    this.roleSessions.clear();
    this.humanInput.reset();

    const results = new Map<string, BuildTaskResult>();
    for (const [id, result] of Object.entries(checkpoint.results)) {
      results.set(id, result);
      if (result.sessionId)
        this.roleSessions.set(result.role, result.sessionId);
    }

    const progress: BuildProgress = {
      id: checkpoint.buildId,
      plan: checkpoint.plan,
      status: "executing",
      currentPhase: checkpoint.currentPhase,
      results,
      buildContext: checkpoint.buildContext,
      totalCostUsd: checkpoint.totalCostUsd,
      totalDurationMs: checkpoint.totalDurationMs,
      startedAt: checkpoint.startedAt,
      completedAt: null,
      retryCount: 0,
    };

    this.activeBuild = progress;
    this.emit({
      type: "build:phase_started",
      buildId: progress.id,
      phaseIndex: progress.currentPhase,
      timestamp: new Date().toISOString(),
      data: {
        message: `Resuming from phase ${progress.currentPhase + 1}/${progress.plan.phases.length}`,
        progress: this.progressSummary(progress, "Resuming..."),
      },
    });

    await this.runBuild(progress, baseOptions, maxBudgetUsd);
    return progress;
  }

  /** Cancel the active build. */
  cancel(): void {
    if (!this.activeBuild) return;
    this.cancelled = true;
    this.manager.cancelAll();
    this.humanInput.rejectAll();

    this.activeBuild.status = "cancelled";
    this.activeBuild.completedAt = new Date().toISOString();
    this.emit({
      type: "build:cancelled",
      buildId: this.activeBuild.id,
      timestamp: this.activeBuild.completedAt,
      data: { message: "Build cancelled by user" },
    });
    this.activeBuild = null;
  }

  /* ── Core build loop ── */

  private async runBuild(
    progress: BuildProgress,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<void> {
    try {
      await this.executePhases(progress, baseOptions, maxBudgetUsd);

      const anyFailed = Array.from(progress.results.values()).some(
        (r) => r.status === "failed",
      );
      progress.status = anyFailed ? "failed" : "completed";
      progress.completedAt = new Date().toISOString();

      if (progress.status === "completed")
        deleteCheckpoint(baseOptions.projectRoot);

      this.emit({
        type:
          progress.status === "completed" ? "build:completed" : "build:failed",
        buildId: progress.id,
        timestamp: progress.completedAt,
        data: {
          message:
            progress.status === "completed"
              ? `Build complete: ${progress.plan.totalTasks} tasks, $${progress.totalCostUsd.toFixed(4)}`
              : "Build finished with errors",
          costUsd: progress.totalCostUsd,
          durationMs: progress.totalDurationMs,
        },
      });
    } catch (err: any) {
      progress.status = "failed";
      progress.completedAt = new Date().toISOString();
      this.emit({
        type: "build:failed",
        buildId: progress.id,
        timestamp: progress.completedAt,
        data: { message: err.message },
      });
    } finally {
      this.activeBuild = null;
    }
  }

  /* ── Phase execution with human gates ── */

  private async executePhases(
    progress: BuildProgress,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<void> {
    const { plan } = progress;

    for (let pi = progress.currentPhase; pi < plan.phases.length; pi++) {
      if (this.cancelled) break;
      if (maxBudgetUsd != null && progress.totalCostUsd >= maxBudgetUsd) {
        this.markRemainingSkipped(progress, "Budget exceeded");
        break;
      }

      const phase = plan.phases[pi];
      progress.currentPhase = pi;

      this.emit({
        type: "build:phase_started",
        buildId: progress.id,
        phaseIndex: pi,
        timestamp: new Date().toISOString(),
        data: {
          message: `Phase ${pi + 1}/${plan.phases.length}: ${phase.name}`,
          progress: this.progressSummary(progress, phase.name),
        },
      });

      await this.executePhaseTasks(progress, phase, baseOptions, maxBudgetUsd);

      // Capture project state
      const snapshot = capturePhaseSnapshot(
        baseOptions.projectRoot,
        phase.name,
      );
      if (snapshot) progress.buildContext.push(snapshot);

      // ── Verification with human decision on failure ──
      if (phase.verify && !this.cancelled) {
        progress.status = "verifying";
        const result = runVerification(
          baseOptions.projectRoot,
          baseOptions.nodePath,
        );

        this.emit({
          type: "build:phase_verified",
          buildId: progress.id,
          phaseIndex: pi,
          timestamp: new Date().toISOString(),
          data: {
            message: result.passed
              ? `Phase ${pi + 1} verification passed`
              : `Phase ${pi + 1} verification issues: ${result.summary}`,
          },
        });

        if (!result.passed) {
          const decision = await this.humanInput.handleVerificationFailure(
            progress.id,
            pi,
            result.output,
          );

          if (decision === "abort") {
            this.markRemainingSkipped(
              progress,
              "Aborted after verification failure",
            );
            break;
          }

          // 'continue' or custom instructions
          if (decision !== "continue" && decision !== "") {
            // User provided custom guidance — inject it as context for next phase
            progress.buildContext.push(
              `## User Guidance After "${phase.name}" Verification\n${decision}`,
            );
          } else {
            progress.buildContext.push(
              `## Verification Issues After "${phase.name}"\n${result.output}`,
            );
          }
        }

        progress.status = "executing";
      }

      this.emit({
        type: "build:phase_completed",
        buildId: progress.id,
        phaseIndex: pi,
        timestamp: new Date().toISOString(),
        data: {
          message: `Phase ${pi + 1} complete: ${phase.name}`,
          progress: this.progressSummary(progress, phase.name),
          costUsd: progress.totalCostUsd,
        },
      });

      saveCheckpoint(progress, baseOptions.projectRoot);

      // ── Phase gate: ask before proceeding to next phase ──
      if (pi < plan.phases.length - 1 && !this.cancelled) {
        const phaseSummary = this.formatPhaseResult(progress, phase, pi);
        const continueToNext = await this.humanInput.approvePhase(
          progress.id,
          pi,
          phaseSummary,
        );

        if (!continueToNext) {
          this.markRemainingSkipped(
            progress,
            "Stopped by user after phase review",
          );
          break;
        }
      }
    }
  }

  /* ── Task execution with human escalation ── */

  private async executePhaseTasks(
    progress: BuildProgress,
    phase: BuildPhase,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<void> {
    const { results } = progress;
    const completed = new Set<string>();

    for (const task of phase.tasks) {
      const r = results.get(task.id);
      if (r && (r.status === "completed" || r.status === "skipped"))
        completed.add(task.id);
    }

    while (completed.size < phase.tasks.length) {
      if (this.cancelled) break;
      if (maxBudgetUsd != null && progress.totalCostUsd >= maxBudgetUsd) break;

      const ready = phase.tasks.filter((t) => {
        if (completed.has(t.id)) return false;
        const result = results.get(t.id);
        if (!result || result.status !== "pending") {
          if (result && result.status !== "pending") completed.add(t.id);
          return false;
        }
        return t.dependsOn.every((dep) => {
          const depResult = results.get(dep);
          return depResult && depResult.status === "completed";
        });
      });

      if (ready.length === 0) {
        for (const t of phase.tasks) {
          if (!completed.has(t.id)) {
            const r = results.get(t.id)!;
            if (r.status === "pending") {
              r.status = "skipped";
              r.error = "Dependency not met";
            }
            completed.add(t.id);
          }
        }
        break;
      }

      await Promise.allSettled(
        ready.map((task) => this.executeTask(progress, task, baseOptions)),
      );
      for (const t of ready) completed.add(t.id);
    }
  }

  private async executeTask(
    progress: BuildProgress,
    task: BuildTask,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    attempt = 0,
  ): Promise<void> {
    const result = progress.results.get(task.id)!;
    result.status = "running";

    this.emit({
      type: "build:task_started",
      buildId: progress.id,
      taskId: task.id,
      timestamp: new Date().toISOString(),
      data: {
        message: `[${task.role}] ${task.title}`,
        role: task.role,
        progress: this.progressSummary(progress, task.title),
      },
    });

    // Accumulated context
    const contextParts: string[] = [];
    if (progress.buildContext.length > 0) {
      contextParts.push(
        "## What Has Been Built So Far\n" +
          progress.buildContext[progress.buildContext.length - 1],
      );
    }
    if (task.dependsOn.length > 0) {
      const depSummaries = task.dependsOn
        .map((depId) => {
          const dep = progress.results.get(depId);
          return dep?.summary ? `- ${depId}: ${dep.summary}` : null;
        })
        .filter(Boolean);
      if (depSummaries.length > 0)
        contextParts.push(
          "## Prerequisite Task Results\n" + depSummaries.join("\n"),
        );
    }
    const contextPrefix =
      contextParts.length > 0 ? contextParts.join("\n\n") + "\n\n---\n\n" : "";

    // Session continuity
    const existingSession = this.roleSessions.get(task.role);
    const isResume = !!existingSession;

    try {
      const execution = await this.manager.execute({
        ...baseOptions,
        prompt: contextPrefix + task.prompt,
        role: task.role,
        sessionId: existingSession,
        resume: isResume,
      });

      result.executionId = execution.id;
      result.sessionId = execution.sessionId;
      this.roleSessions.set(task.role, execution.sessionId);

      if (execution.status === "done") {
        result.status = "completed";
        result.costUsd = execution.costUsd;
        result.durationMs = execution.durationMs;
        result.summary = `[${task.role}] ${task.title}: completed`;
        progress.totalCostUsd += execution.costUsd;
        progress.totalDurationMs += execution.durationMs;

        this.emit({
          type: "build:task_completed",
          buildId: progress.id,
          taskId: task.id,
          timestamp: new Date().toISOString(),
          data: {
            message: `[${task.role}] ${task.title} — done`,
            role: task.role,
            costUsd: execution.costUsd,
            durationMs: execution.durationMs,
            progress: this.progressSummary(progress, task.title),
          },
        });
      } else {
        await this.handleTaskFailure(
          progress,
          task,
          baseOptions,
          execution.error ?? "Unknown error",
          attempt,
        );
      }
    } catch (err: any) {
      await this.handleTaskFailure(
        progress,
        task,
        baseOptions,
        err.message,
        attempt,
      );
    }
  }

  /* ── Failure handling with human escalation ── */

  private async handleTaskFailure(
    progress: BuildProgress,
    task: BuildTask,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    error: string,
    attempt: number,
  ): Promise<void> {
    const result = progress.results.get(task.id)!;

    // Automatic retries first
    if (attempt < MAX_TASK_RETRIES) {
      progress.retryCount++;
      this.emit({
        type: "build:task_retrying",
        buildId: progress.id,
        taskId: task.id,
        timestamp: new Date().toISOString(),
        data: {
          message: `[${task.role}] ${task.title} failed, retrying (${attempt + 1}/${MAX_TASK_RETRIES}): ${error}`,
          role: task.role,
        },
      });

      result.status = "pending";
      const originalPrompt = task.prompt;
      task.prompt = `${originalPrompt}\n\nIMPORTANT: A previous attempt at this task failed with:\n${error}\n\nPlease diagnose the issue and try a different approach.`;
      await this.executeTask(progress, task, baseOptions, attempt + 1);
      task.prompt = originalPrompt;
      return;
    }

    // All retries exhausted — ask the human
    this.emit({
      type: "build:task_failed",
      buildId: progress.id,
      taskId: task.id,
      timestamp: new Date().toISOString(),
      data: {
        message: `[${task.role}] ${task.title} failed after ${MAX_TASK_RETRIES + 1} attempts: ${error}`,
        role: task.role,
      },
    });

    const decision = await this.humanInput.handleFailure(
      progress.id,
      task.id,
      task.title,
      error,
    );

    switch (decision) {
      case "retry": {
        // Ask for custom instructions
        const guidance = await this.humanInput.askClarification(
          progress.id,
          `What instructions should the ${task.role} agent follow for this retry?`,
          `Task: ${task.title}\nLast error: ${error}`,
        );

        result.status = "pending";
        progress.retryCount++;

        const originalPrompt = task.prompt;
        if (guidance) {
          task.prompt = `${originalPrompt}\n\nUser guidance for this task:\n${guidance}\n\nPrevious error: ${error}`;
        }
        await this.executeTask(progress, task, baseOptions, 0); // reset attempt counter
        task.prompt = originalPrompt;
        break;
      }

      case "skip":
        result.status = "skipped";
        result.error = `Skipped by user after failure: ${error}`;
        break;

      case "abort":
        result.status = "failed";
        result.error = error;
        this.markRemainingSkipped(
          progress,
          "Aborted by user after task failure",
        );
        this.cancelled = true;
        break;
    }
  }

  /* ── Formatting for human review ── */

  private formatPlanForReview(plan: BuildPlan): string {
    const lines: string[] = [
      `# ${plan.name}`,
      "",
      plan.summary,
      "",
      `**${plan.phases.length} phases, ${plan.totalTasks} tasks total**`,
      "",
    ];

    for (let i = 0; i < plan.phases.length; i++) {
      const phase = plan.phases[i];
      lines.push(`## Phase ${i + 1}: ${phase.name}`);
      lines.push(phase.description);
      if (phase.verify) lines.push("*Verification: enabled*");
      lines.push("");
      for (const task of phase.tasks) {
        lines.push(`- **[${task.role}]** ${task.title}`);
        if (task.description) lines.push(`  ${task.description}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  private formatPhaseResult(
    progress: BuildProgress,
    phase: BuildPhase,
    phaseIndex: number,
  ): string {
    const lines: string[] = [
      `## Phase ${phaseIndex + 1} Results: ${phase.name}`,
      "",
    ];

    for (const task of phase.tasks) {
      const r = progress.results.get(task.id);
      if (!r) continue;
      const icon =
        r.status === "completed"
          ? "OK"
          : r.status === "skipped"
            ? "SKIPPED"
            : "FAILED";
      lines.push(`- [${icon}] **[${task.role}]** ${task.title}`);
      if (r.error) lines.push(`  Error: ${r.error}`);
      if (r.costUsd > 0) lines.push(`  Cost: $${r.costUsd.toFixed(4)}`);
    }

    lines.push("");
    lines.push(`Total cost so far: $${progress.totalCostUsd.toFixed(4)}`);

    return lines.join("\n");
  }

  /* ── Helpers ── */

  private initProgress(
    buildId: string,
    plan: BuildPlan,
    startedAt: string,
  ): BuildProgress {
    const results = new Map<string, BuildTaskResult>();
    for (const phase of plan.phases) {
      for (const task of phase.tasks) {
        results.set(task.id, {
          taskId: task.id,
          role: task.role,
          status: "pending",
          executionId: null,
          summary: null,
          error: null,
          costUsd: 0,
          durationMs: 0,
          sessionId: null,
        });
      }
    }
    return {
      id: buildId,
      plan,
      status: "executing",
      currentPhase: 0,
      results,
      buildContext: [],
      totalCostUsd: 0,
      totalDurationMs: 0,
      startedAt,
      completedAt: null,
      retryCount: 0,
    };
  }

  private markRemainingSkipped(progress: BuildProgress, reason: string): void {
    for (const [, result] of progress.results) {
      if (result.status === "pending") {
        result.status = "skipped";
        result.error = reason;
      }
    }
  }

  private progressSummary(
    progress: BuildProgress,
    currentLabel: string,
  ): { completed: number; total: number; phase: string } {
    let completed = 0;
    for (const [, r] of progress.results) {
      if (r.status === "completed") completed++;
    }
    return { completed, total: progress.plan.totalTasks, phase: currentLabel };
  }

  private emit(event: BuildEvent): void {
    for (const cb of this.listeners) {
      try {
        cb(event);
      } catch (err) {
        console.error("[project-builder] Event listener error:", err);
      }
    }
  }
}
