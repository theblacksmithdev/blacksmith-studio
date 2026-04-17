import { DecomposableAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

/**
 * Generalist agent — the single-agent chat's worker.
 *
 * Uses DecomposableAgent so a very long or multi-part request can be
 * broken into focused sub-tasks within the same session. All roles
 * that touch multiple files benefit from this, and the generalist is
 * the most likely to see wide-ranging requests.
 */
export class GeneralistAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return prompt;
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const writes = toolCalls.filter(
      (tc) => tc.toolName === "Write" || tc.toolName === "Edit",
    ).length;
    if (writes > 0) {
      return `${writes} file${writes === 1 ? "" : "s"} touched`;
    }
    const firstLine = fullResponse.split("\n").find((l) => l.trim());
    return (firstLine ?? "Done").slice(0, 120);
  }
}
