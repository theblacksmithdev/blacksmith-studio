import type { BaseAgent, AgentExecuteOptions } from "../base/index.js";
import type { AgentRole, AgentExecution, AgentEvent } from "../types.js";

const MAX_HANDOFF_DEPTH = 5;

type ExecuteFn = (
  options: AgentExecuteOptions & { role?: AgentRole },
) => Promise<AgentExecution>;
type GetAgentFn = (role: AgentRole) => BaseAgent | undefined;
type GetLastHandoffFn = () => AgentEvent | null;
type ClearLastHandoffFn = () => void;

/**
 * Process handoff events emitted during agent execution.
 * Dispatches the target agent and recurses for chained handoffs.
 *
 * Guards:
 * - Max depth prevents runaway chains
 * - Visited set prevents circular handoffs (A → B → A)
 */
export async function processHandoffs(
  sourceAgent: BaseAgent,
  execution: AgentExecution,
  originalOptions: AgentExecuteOptions,
  lastHandoffEvent: AgentEvent | null,
  execute: ExecuteFn,
  getAgent: GetAgentFn,
  getLastHandoff: GetLastHandoffFn,
  clearLastHandoff: ClearLastHandoffFn,
  depth = 0,
  visited = new Set<AgentRole>(),
): Promise<void> {
  if (depth >= MAX_HANDOFF_DEPTH) {
    console.warn(
      `[handoff] Max depth (${MAX_HANDOFF_DEPTH}) reached, stopping chain`,
    );
    return;
  }

  if (!lastHandoffEvent || lastHandoffEvent.data.type !== "handoff") return;

  const { targetRole, reason, context } = lastHandoffEvent.data as {
    type: "handoff";
    targetRole: AgentRole;
    reason: string;
    context: string;
  };

  // Circular handoff detection
  if (visited.has(targetRole)) {
    console.warn(
      `[handoff] Circular handoff detected: ${Array.from(visited).join(" → ")} → ${targetRole}, stopping`,
    );
    return;
  }

  const targetAgent = getAgent(targetRole);
  if (!targetAgent) {
    console.warn(`[handoff] Target "${targetRole}" not found`);
    return;
  }

  if (targetAgent.isRunning) {
    console.warn(`[handoff] Target "${targetRole}" is busy, skipping`);
    return;
  }

  visited.add(sourceAgent.role);
  clearLastHandoff();

  console.log(
    `[handoff] ${sourceAgent.role} → ${targetRole} (reason: ${reason})`,
  );

  const handoffExecution = await execute({
    ...originalOptions,
    prompt: `Handoff from ${sourceAgent.title}.\n\nReason: ${reason}\n\nContext:\n${context}\n\nOriginal task: ${execution.prompt}`,
    role: targetRole,
  });

  // Recurse: check if the handoff execution itself emitted another handoff
  if (handoffExecution.status === "done") {
    const nextHandoff = getLastHandoff();
    if (nextHandoff) {
      await processHandoffs(
        targetAgent,
        handoffExecution,
        originalOptions,
        nextHandoff,
        execute,
        getAgent,
        getLastHandoff,
        clearLastHandoff,
        depth + 1,
        visited,
      );
    }
  }
}
