import type { ConversationEventService } from "../events/index.js";
import type {
  CommandResult,
  CommandSpec,
  ResolvedInvocation,
} from "./types.js";

/**
 * Persists a compact `command_executed` row into the unified
 * conversation event log so every spawn shows up in the Timeline and
 * in audit queries.
 *
 * Single Responsibility: bridge between the CommandService's internal
 * result shape and the conversation event log. Kept narrow so the
 * service stays ignorant of EventType literals.
 */
export class CommandEventEmitter {
  constructor(private readonly events: ConversationEventService) {}

  emitCompleted(
    spec: CommandSpec,
    invocation: ResolvedInvocation,
    result: CommandResult,
  ): void {
    if (!spec.conversationId) return; // Only conversation-bound runs hit the event log.
    this.events.append({
      projectId: spec.projectId,
      scope: "agent_chat",
      conversationId: spec.conversationId,
      taskId: spec.taskId ?? null,
      agentRole: spec.agentRole ?? null,
      eventType: "command_executed",
      payload: {
        runId: result.runId,
        toolchainId: invocation.toolchainId,
        preset: invocation.preset,
        command: invocation.command,
        args: invocation.args,
        scope: invocation.scope,
        cwd: invocation.cwd,
        resolvedEnvDisplay: invocation.resolvedEnvDisplay,
        status: result.status,
        exitCode: result.exitCode,
        durationMs: result.durationMs,
        description: spec.description ?? null,
      },
    });
  }
}
