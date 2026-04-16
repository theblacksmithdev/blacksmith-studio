import type { BaseAgent, AgentExecuteOptions } from "../../base/index.js";
import type {
  AgentRole,
  AgentExecution,
  AgentEvent,
} from "../../types.js";
import { processHandoffs } from "../handoff.js";
import type { AgentEventEmitter } from "./agent-event-emitter.js";
import type { ExecutionHistory } from "./execution-history.js";

/**
 * Executes a single agent with session tracking and handoff processing.
 *
 * Single Responsibility: the execute-one-agent lifecycle — resolve role,
 * guard against concurrent runs, forward events, track sessions, and
 * process handoffs. History persistence is delegated to ExecutionHistory.
 */
export class AgentExecutor {
  private lastHandoffEvent: AgentEvent | null = null;
  private resolveRole: (prompt: string) => AgentRole | null = () => null;

  constructor(
    private readonly registry: Map<AgentRole, BaseAgent>,
    private readonly roleSessions: Map<AgentRole, string>,
    private readonly emitter: AgentEventEmitter,
    private readonly history: ExecutionHistory,
  ) {}

  /**
   * Wire the role resolver after construction. Breaks the AgentExecutor ↔
   * Dispatcher cycle without forward-referencing an undefined field.
   */
  setRoleResolver(resolve: (prompt: string) => AgentRole | null): void {
    this.resolveRole = resolve;
  }

  async execute(
    options: AgentExecuteOptions & { role?: AgentRole },
  ): Promise<AgentExecution> {
    const role = options.role ?? this.resolveRole(options.prompt);
    if (!role)
      throw new Error(
        "Cannot determine agent role. Use dispatch() for ambiguous prompts.",
      );

    const agent = this.registry.get(role);
    if (!agent) throw new Error(`Unknown agent role: ${role}`);
    if (agent.isRunning)
      throw new Error(`Agent "${agent.title}" is already busy`);

    const unsub = agent.onEvent((event) => this.forwardAgentEvent(event));

    try {
      const execution = await agent.execute(options);
      this.history.push(execution);

      // Track latest session per role for cross-execution continuity
      // (e.g. quality gate fix rounds resuming the task session)
      if (execution.sessionId) {
        this.roleSessions.set(role, execution.sessionId);
      }

      if (execution.status === "done") {
        await processHandoffs(
          agent,
          execution,
          options,
          this.lastHandoffEvent,
          (opts) => this.execute(opts),
          (r) => this.registry.get(r),
          () => this.lastHandoffEvent,
          () => {
            this.lastHandoffEvent = null;
          },
        );
      }
      // Always clear — a stale handoff from a failed execution must not
      // leak into the next execute() call.
      this.lastHandoffEvent = null;

      return execution;
    } finally {
      unsub();
    }
  }

  private forwardAgentEvent(event: AgentEvent): void {
    if (event.type === "handoff") this.lastHandoffEvent = event;
    this.emitter.emitAgentEvent(event);
  }
}
