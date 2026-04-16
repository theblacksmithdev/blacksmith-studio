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
import type { DispatchPlan } from "../pm-dispatcher.js";
import type { PipelineTemplate } from "../pipelines.js";
import { EventBus } from "./event-bus.js";
import { AgentExecutor } from "./agent-executor.js";
import { Dispatcher } from "./dispatcher.js";
import { WorkflowRunner } from "./workflow-runner.js";

/**
 * AgentManager — thin facade that composes focused collaborators.
 *
 * Each concern is owned by a single class:
 * - EventBus       — listener management + event emission
 * - AgentExecutor  — single-agent execution + sessions + handoffs
 * - Dispatcher     — PM-first dispatch orchestration + quality gates
 * - WorkflowRunner — pipeline/workflow lifecycle
 *
 * This class owns shared state (registry, sessions, cancellation flag)
 * and delegates all behavior.
 */
export class AgentManager {
  private readonly registry: Map<AgentRole, BaseAgent>;
  private readonly roleSessions = new Map<AgentRole, string>();
  private _cancelled = false;

  private readonly events: EventBus;
  private readonly agentExecutor: AgentExecutor;
  private readonly dispatcher: Dispatcher;
  private readonly workflows: WorkflowRunner;

  constructor() {
    this.registry = createAgentRegistry();
    this.events = new EventBus();
    this.agentExecutor = new AgentExecutor(
      this.registry,
      this.roleSessions,
      this.events,
      (prompt) => this.dispatcher.route(prompt),
    );
    this.dispatcher = new Dispatcher(
      this.registry,
      this.roleSessions,
      this.agentExecutor,
      this.events,
      () => this._cancelled,
    );
    this.workflows = new WorkflowRunner(
      this.events,
      (opts) => this.agentExecutor.execute(opts),
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
    this._cancelled = false;
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
    this._cancelled = true;

    for (const agent of this.registry.values()) {
      if (agent.isRunning) agent.cancel();
    }

    this.workflows.cancelAll();
    this.events.emitPM("Execution cancelled by user");
  }

  /* ── Pipelines & Workflows ── */

  listPipelines(): PipelineTemplate[] {
    return this.workflows.listPipelines();
  }

  async runPipeline(
    pipelineId: string,
    prompt: string,
    baseOptions: Omit<AgentExecuteOptions, "prompt">,
    maxBudgetUsd?: number,
  ): Promise<Workflow> {
    return this.workflows.runPipeline(
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
    return this.workflows.runWorkflow(name, steps, baseOptions, maxBudgetUsd);
  }

  /* ── Events ── */

  onAgentEvent(cb: AgentEventCallback): () => void {
    return this.events.onAgentEvent(cb);
  }

  onWorkflowEvent(cb: WorkflowEventCallback): () => void {
    return this.events.onWorkflowEvent(cb);
  }

  /* ── History & State ── */

  getExecutionHistory(limit = 50): AgentExecution[] {
    return this.agentExecutor.getHistory(limit);
  }

  getActiveWorkflows(): Workflow[] {
    return this.workflows.getActive();
  }
}
