import type { BaseAgent, AgentExecuteOptions } from "../../base/index.js";
import { takeSnapshot, computeChanges } from "../../utils/change-tracker.js";
import type { ChangeSet } from "../../utils/change-tracker.js";
import type { AgentRole, AgentExecution } from "../../types.js";
import { ArtifactManager } from "../../artifacts.js";
import { routePrompt, type RouteResult } from "../router.js";
import {
  buildDirectPlan,
  dispatchWithPM,
  type DispatchPlan,
  type ReviewLevel,
} from "../pm-dispatcher/index.js";
import { needsQualityGate, runQualityGate } from "../quality-gate.js";
import { TaskPlanExecutor } from "../task-plan/index.js";
import type { ICancellationToken } from "../task-plan/types.js";
import type { AgentEventEmitter } from "./agent-event-emitter.js";
import type { AgentExecutor } from "./agent-executor.js";

/**
 * Handles the PM-first dispatch flow: routing → PM decomposition →
 * single-task or multi-task execution with quality gates.
 *
 * Single Responsibility: dispatch orchestration.
 * Dependency Inversion: depends on AgentExecutor, AgentEventEmitter, and
 * ICancellationToken rather than owning execution, event, or cancel logic.
 */
export class Dispatcher {
  constructor(
    private readonly registry: Map<AgentRole, BaseAgent>,
    private readonly roleSessions: Map<AgentRole, string>,
    private readonly executor: AgentExecutor,
    private readonly emitter: AgentEventEmitter,
    private readonly cancellation: ICancellationToken,
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
    try {
      const result = await this.runDispatch(options);
      const anyFailed = result.executions.some((e) => e.status === "error");
      this.emitter.emitPMStatus(
        anyFailed ? "error" : "done",
        anyFailed ? "Dispatch completed with errors" : "Dispatch complete",
      );
      return result;
    } catch (err) {
      // Ensure the PM spinner clears even when the dispatch blows up.
      this.emitter.emitPMStatus("error", "Dispatch failed");
      throw err;
    }
  }

  private async runDispatch(
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
    this.emitter.emitPM("Analyzing request and assigning tasks...");

    const plan = await dispatchWithPM(options.prompt, options, (event) =>
      this.emitter.emitAgentEvent(event),
    );

    if (plan.mode === "clarification") {
      this.emitter.emitPM(plan.summary);
      return { plan, executions: [] };
    }

    this.emitter.emitPM(`Plan: ${plan.summary}`);
    this.emitter.emitDispatchPlan(plan);

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
    const plan = buildDirectPlan(role, agent.title, options.prompt);

    this.emitter.emitDispatchPlan(plan);

    const withSession = this.maybeResumeFromPriorSession(options, role);
    const execution = await this.executor.execute({
      ...withSession,
      role,
      prompt: this.prependConversationPreamble(
        withSession,
        withSession.prompt,
        plan,
      ),
    });
    const executions = [execution];

    if (execution.status === "done" && needsQualityGate(role, "light")) {
      const changes = computeChanges(options.projectRoot, snapshot);
      const gateExecs = await this.runQualityGate(
        { ...plan.task!, reviewLevel: "light" },
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
    const withSession = this.maybeResumeFromPriorSession(options, task.role);
    const execution = await this.executor.execute({
      ...withSession,
      prompt: this.prependConversationPreamble(withSession, task.prompt, plan),
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
      this.emitter,
      {
        run: (ctx, opts, changes) => this.runQualityGate(ctx, opts, changes),
      },
      this.cancellation,
    );
    const executions = await taskPlan.execute(
      plan.tasks,
      options,
      artifacts,
      this.roleSessions,
    );

    return { plan, executions };
  }

  /**
   * If a session id for this role was loaded from a prior dispatch in the
   * same conversation and the caller didn't set one explicitly, splice it
   * in with `resume: true` so direct / single-task dispatches continue the
   * agent's session instead of starting fresh.
   */
  private maybeResumeFromPriorSession(
    options: AgentExecuteOptions,
    role: AgentRole,
  ): AgentExecuteOptions {
    if (options.sessionId) return options;
    const priorSession = this.roleSessions.get(role);
    if (!priorSession) return options;
    return { ...options, sessionId: priorSession, resume: true };
  }

  /**
   * Prepend the conversation preamble (original user request + PM plan
   * summary) to a prompt when this is the first turn for a role. On
   * resume (role already has a session) the agent already saw the
   * preamble on a prior turn — re-injecting it would be noise.
   */
  private prependConversationPreamble(
    options: AgentExecuteOptions,
    prompt: string,
    plan: DispatchPlan,
  ): string {
    const ctx = options.conversationContext;
    if (!ctx) return prompt;
    if (options.resume && options.sessionId) return prompt;

    const preamble = ctx.formatWorkerPreamble(plan.summary);
    return `${preamble}\n\n---\n\n${prompt}`;
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
    this.emitter.emitPM(
      `Running quality gate${fileCount > 0 ? ` on ${fileCount} changed files` : ""}...`,
    );

    const gateResult = await runQualityGate(
      context,
      options,
      (opts) => this.executor.execute(opts),
      (event) => this.emitter.emitAgentEvent(event),
      changes,
      (role) => this.roleSessions.get(role),
      () => this.cancellation.isCancelled(),
    );

    this.emitter.emitPM(
      gateResult.passed
        ? `Quality gate passed (${gateResult.reviewCycles} review, ${gateResult.testCycles} test cycles)`
        : "Quality gate completed with issues",
    );

    return gateResult.executions;
  }
}
