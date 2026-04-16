import type { BaseAgent, AgentExecuteOptions } from "../../base/index.js";
import { takeSnapshot, computeChanges } from "../../utils/change-tracker.js";
import type { ChangeSet } from "../../utils/change-tracker.js";
import type { AgentRole, AgentExecution } from "../../types.js";
import { ArtifactManager } from "../../artifacts.js";
import { routePrompt, type RouteResult } from "../router.js";
import {
  dispatchWithPM,
  type DispatchPlan,
  type DispatchTask,
  type ReviewLevel,
} from "../pm-dispatcher.js";
import { needsQualityGate, runQualityGate } from "../quality-gate.js";
import { TaskPlanExecutor } from "../task-plan/index.js";
import type { EventBus } from "./event-bus.js";
import type { AgentExecutor } from "./agent-executor.js";

/**
 * Handles the PM-first dispatch flow: routing → PM decomposition →
 * single-task or multi-task execution with quality gates.
 *
 * Single Responsibility: dispatch orchestration.
 * Dependency Inversion: depends on AgentExecutor and EventBus abstractions
 * rather than owning execution or event logic itself.
 */
export class Dispatcher {
  constructor(
    private readonly registry: Map<AgentRole, BaseAgent>,
    private readonly roleSessions: Map<AgentRole, string>,
    private readonly executor: AgentExecutor,
    private readonly events: EventBus,
    private readonly getCancelled: () => boolean,
  ) {}

  route(prompt: string): RouteResult {
    return routePrompt(prompt, this.registry);
  }

  /**
   * Dispatch a prompt through the PM-first model.
   *
   * 1. Fast path: explicit @role or "as a ..." → direct to that agent.
   * 2. PM path: ambiguous or multi-scope → PM decomposes into tasks.
   */
  async dispatch(
    options: AgentExecuteOptions,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    // ── Fast path: explicit role mention ──
    const routeResult = this.route(options.prompt);
    if (routeResult.confidence === "high" && routeResult.role) {
      const lower = options.prompt.toLowerCase();
      const agent = this.registry.get(routeResult.role);
      const isExplicit =
        agent &&
        (lower.includes(`@${routeResult.role}`) ||
          lower.includes(`as a ${agent.title.toLowerCase()}`));

      if (isExplicit) {
        return this.dispatchDirect(options, routeResult.role, agent!);
      }
    }

    // ── PM path ──
    this.events.emitAgentEvent({
      type: "activity",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: {
        type: "activity",
        description: "Analyzing request and assigning tasks...",
      },
    });

    const plan = await dispatchWithPM(options.prompt, options, (event) =>
      this.events.emitAgentEvent(event),
    );

    if (plan.mode === "clarification") {
      this.events.emitPM(plan.summary);
      return { plan, executions: [] };
    }

    this.events.emitPM(`Plan: ${plan.summary}`);
    this.events.emitDispatchPlan(plan);

    if (plan.mode === "single" && plan.task) {
      return this.dispatchSingle(plan, options);
    }

    return this.dispatchMulti(plan, options);
  }

  /** Direct dispatch when user explicitly targets a role */
  private async dispatchDirect(
    options: AgentExecuteOptions,
    role: AgentRole,
    agent: BaseAgent,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    const snapshot = takeSnapshot(options.projectRoot);
    const directTask: DispatchTask = {
      id: "t0",
      title: options.prompt.slice(0, 60),
      description: "",
      role,
      prompt: options.prompt,
      dependsOn: [],
      model: "balanced",
      reviewLevel: "light",
    };
    const plan: DispatchPlan = {
      mode: "single",
      task: directTask,
      tasks: [directTask],
      summary: `Direct to ${agent.title} (requested by user)`,
    };

    this.events.emitDispatchPlan(plan);

    const execution = await this.executor.execute({ ...options, role });
    const executions = [execution];

    if (execution.status === "done" && needsQualityGate(role, "light")) {
      const changes = computeChanges(options.projectRoot, snapshot);
      const gateExecs = await this.runQualityGate(
        { ...directTask, reviewLevel: "light" },
        options,
        changes,
      );
      executions.push(...gateExecs);
    }

    return { plan, executions };
  }

  /** Single-task dispatch from PM */
  private async dispatchSingle(
    plan: DispatchPlan,
    options: AgentExecuteOptions,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    const task = plan.task!;
    const snapshot = takeSnapshot(options.projectRoot);
    const execution = await this.executor.execute({
      ...options,
      prompt: task.prompt,
      role: task.role,
    });
    const executions = [execution];

    if (
      execution.status === "done" &&
      needsQualityGate(task.role, task.reviewLevel)
    ) {
      const changes = computeChanges(options.projectRoot, snapshot);
      const gateExecs = await this.runQualityGate(task, options, changes);
      executions.push(...gateExecs);
    }

    return { plan, executions };
  }

  /** Multi-task dispatch via TaskPlanExecutor */
  private async dispatchMulti(
    plan: DispatchPlan,
    options: AgentExecuteOptions,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    const artifacts = new ArtifactManager(options.projectRoot);
    artifacts.ensureGitignore();

    const taskPlan = new TaskPlanExecutor(
      { execute: (opts) => this.executor.execute(opts) },
      {
        emitAgentEvent: (event) => this.events.emitAgentEvent(event),
        emitPM: (desc) => this.events.emitPM(desc),
        emitTaskStatus: (id, status, title, role) =>
          this.events.emitTaskStatus(id, status, title, role),
      },
      {
        run: (ctx, opts, changes) => this.runQualityGate(ctx, opts, changes),
      },
      { isCancelled: this.getCancelled },
    );
    const executions = await taskPlan.execute(plan.tasks, options, artifacts);

    return { plan, executions };
  }

  /** Run the quality gate — wraps the quality-gate module with session + cancel context */
  private async runQualityGate(
    context: {
      role: AgentRole;
      prompt: string;
      title: string;
      reviewLevel?: ReviewLevel;
    },
    options: AgentExecuteOptions,
    changes?: ChangeSet,
  ): Promise<AgentExecution[]> {
    const fileCount = changes?.files.length ?? 0;
    this.events.emitPM(
      `Running quality gate${fileCount > 0 ? ` on ${fileCount} changed files` : ""}...`,
    );

    const gateResult = await runQualityGate(
      context,
      options,
      (opts) => this.executor.execute(opts),
      (event) => this.events.emitAgentEvent(event),
      changes,
      (role) => this.roleSessions.get(role),
      this.getCancelled,
    );

    this.events.emitAgentEvent({
      type: "activity",
      agentId: "product-manager",
      executionId: "",
      timestamp: new Date().toISOString(),
      data: {
        type: "activity",
        description: gateResult.passed
          ? `Quality gate passed (${gateResult.reviewCycles} review, ${gateResult.testCycles} test cycles)`
          : "Quality gate completed with issues",
      },
    });

    return gateResult.executions;
  }
}
