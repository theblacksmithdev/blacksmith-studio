import type { BaseAgent, AgentExecuteOptions } from "../../base/index.js";
import type {
  AgentRole,
  AgentExecution,
  AgentEvent,
} from "../../types.js";
import { processHandoffs } from "../handoff.js";
import type { EventBus } from "./event-bus.js";

/**
 * Executes a single agent with session tracking and handoff processing.
 *
 * Single Responsibility: the execute-one-agent lifecycle — resolve role,
 * guard against concurrent runs, forward events, track sessions, process
 * handoffs, and manage execution history.
 */
export class AgentExecutor {
  private static readonly MAX_HISTORY = 200;
  private executionHistory: AgentExecution[] = [];
  private lastHandoffEvent: AgentEvent | null = null;

  constructor(
    private readonly registry: Map<AgentRole, BaseAgent>,
    private readonly roleSessions: Map<AgentRole, string>,
    private readonly events: EventBus,
    private readonly route: (prompt: string) => { role: AgentRole | null },
  ) {}

  /**
   * Execute a prompt with a specific agent role.
   * Tracks sessions, processes handoffs, and records history.
   */
  async execute(
    options: AgentExecuteOptions & { role?: AgentRole },
  ): Promise<AgentExecution> {
    const role = options.role ?? this.route(options.prompt).role;
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
      this.pushHistory(execution);

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

  getHistory(limit = 50): AgentExecution[] {
    return this.executionHistory.slice(-limit);
  }

  private pushHistory(execution: AgentExecution): void {
    this.executionHistory.push(execution);
    if (this.executionHistory.length > AgentExecutor.MAX_HISTORY) {
      this.executionHistory = this.executionHistory.slice(
        -AgentExecutor.MAX_HISTORY,
      );
    }
  }

  private forwardAgentEvent(event: AgentEvent): void {
    if (event.type === "handoff") this.lastHandoffEvent = event;
    this.events.emitAgentEvent(event);
  }
}
