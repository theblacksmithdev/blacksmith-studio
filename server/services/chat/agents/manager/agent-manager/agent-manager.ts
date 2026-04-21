import type { AgentExecuteOptions } from "../../base/index.js";
import type {
  AgentRole,
  AgentExecution,
  AgentEventCallback,
  Workflow,
  WorkflowEventCallback,
} from "../../types.js";
import type { BaseAgent } from "../../base/index.js";
import { createAgentRegistry } from "../../roles/index.js";
import type { RouteResult } from "../router.js";
import type { DispatchPlan } from "../pm-dispatcher/index.js";
import type { PipelineTemplate } from "../pipelines.js";
import { EventBus } from "./event-bus.js";
import { AgentEventEmitter } from "./agent-event-emitter.js";
import { AgentExecutor } from "./agent-executor.js";
import { ExecutionHistory } from "./execution-history.js";
import { CancellationToken } from "./cancellation-token.js";
import { Dispatcher } from "./dispatcher.js";
import { WorkflowRunner } from "./workflow-runner.js";

/**
 * AgentManager — thin facade that composes focused collaborators.
 *
 * Each concern is owned by a single class:
 * - EventBus          — low-level listener management
 * - AgentEventEmitter — domain-shaped event emission (PM, task status, plans)
 * - AgentExecutor     — single-agent execution + sessions + handoffs
 * - ExecutionHistory  — bounded history of past executions
 * - CancellationToken — cancellation state shared across collaborators
 * - Dispatcher        — PM-first dispatch orchestration + quality gates
 * - WorkflowRunner    — pipeline/workflow lifecycle
 *
 * This class owns the registry + session map and delegates all behavior.
 */
export class AgentManager {
  private readonly registry: Map<AgentRole, BaseAgent>;
  private readonly roleSessions = new Map<AgentRole, string>();

  private readonly bus: EventBus;
  private readonly emitter: AgentEventEmitter;
  private readonly history: ExecutionHistory;
  private readonly cancellation: CancellationToken;
  private readonly agentExecutor: AgentExecutor;
  private readonly dispatcher: Dispatcher;
  private readonly workflowRunner: WorkflowRunner;

  constructor() {
    this.registry = createAgentRegistry();
    this.bus = new EventBus();
    this.emitter = new AgentEventEmitter(this.bus);
    this.history = new ExecutionHistory();
    this.cancellation = new CancellationToken();

    this.agentExecutor = new AgentExecutor(
      this.registry,
      this.roleSessions,
      this.emitter,
      this.history,
    );
    this.dispatcher = new Dispatcher(
      this.registry,
      this.roleSessions,
      this.agentExecutor,
      this.emitter,
      this.cancellation,
    );
    // Wire the role resolver now that dispatcher exists — avoids a
    // constructor forward reference.
    this.agentExecutor.setRoleResolver(
      (prompt) => this.dispatcher.route(prompt).role,
    );

    this.workflowRunner = new WorkflowRunner(this.bus, (opts) =>
      this.agentExecutor.execute(opts),
    );
  }

  /* ── Sessions ── */

  loadSessions(sessions: Map<string, string>): void {
    for (const [role, sid] of sessions) {
      this.roleSessions.set(role as AgentRole, sid);
    }
  }

  /* ── Registry ── */

  listAgents(): {
    role: AgentRole;
    title: string;
    description: string;
    isRunning: boolean;
  }[] {
    return Array.from(this.registry.values()).map((agent) => ({
      role: agent.role,
      title: agent.title,
      description: agent.definition.description,
      isRunning: agent.isRunning,
    }));
  }

  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.registry.get(role);
  }

  /* ── Routing ── */

  route(prompt: string): RouteResult {
    return this.dispatcher.route(prompt);
  }

  /* ── Dispatch ── */

  async dispatch(
    options: AgentExecuteOptions,
  ): Promise<{ plan: DispatchPlan; executions: AgentExecution[] }> {
    this.cancellation.reset();
    return this.dispatcher.dispatch(options);
  }

  /* ── Direct Execution ── */

  async execute(
    options: AgentExecuteOptions & { role?: AgentRole },
  ): Promise<AgentExecution> {
    return this.agentExecutor.execute(options);
  }

  /* ── Cancellation ── */

  cancel(role: AgentRole): void {
    this.registry.get(role)?.cancel();
  }

  cancelAll(): void {
    this.cancellation.cancel();

    // Kill any in-flight PM subprocesses FIRST — before clearing agents —
    // so the PM dispatch/refine/replan loop stops immediately instead of
    // completing its current Claude call. Worker agents already handle
    // their own subprocess via BaseAgent.cancel() below; the PM path
    // doesn't go through the registry, so the Dispatcher owns its own
    // tracking and SIGTERM flow.
    this.dispatcher.cancelActivePM();

    for (const agent of this.registry.values()) {
      if (agent.isRunning) agent.cancel();
    }

    this.workflowRunner.cancelAll();
    this.emitter.emitPM("Execution cancelled by user");
    this.emitter.emitPMStatus("error", "Cancelled by user");
  }

  /* ── Pipelines & Workflows ── */

  listPipelines(): PipelineTemplate[] {
    return this.workflowRunner.listPipelines();
  }

  async runPipeline(
    pipelineId: string,
    prompt: string,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    return this.workflowRunner.runPipeline(
      pipelineId,
      prompt,
      baseOptions,
      maxBudgetUsd,
    );
  }

  async runWorkflow(
    name: string,
    steps: { role: AgentRole; prompt: string; dependsOn?: number }[],
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    return this.workflowRunner.runWorkflow(
      name,
      steps,
      baseOptions,
      maxBudgetUsd,
    );
  }

  /* ── Events ── */

  onAgentEvent(cb: AgentEventCallback): () => void {
    return this.bus.onAgentEvent(cb);
  }

  onWorkflowEvent(cb: WorkflowEventCallback): () => void {
    return this.bus.onWorkflowEvent(cb);
  }

  /* ── History & State ── */

  getExecutionHistory(limit = 50): AgentExecution[] {
    return this.history.tail(limit);
  }

  getActiveWorkflows(): Workflow[] {
    return this.workflowRunner.getActive();
  }
}
