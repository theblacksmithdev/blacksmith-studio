import { DecomposableAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class BackendEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Guidelines for this task:",
      "- Use Class-Based Views. Service classes for business logic. Thin views.",
      "- Include proper serializers with validation for all API endpoints.",
      "- Add appropriate indexes and constraints to any new model fields.",
      "- Write or update tests for any logic you add or modify.",
      "- If this requires frontend changes, describe the API contract (URL, method, request/response shape) but do not modify frontend code.",
    ].join("\n");
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const filesCreated = toolCalls.filter(
      (tc) => tc.toolName === "Write",
    ).length;
    const filesEdited = toolCalls.filter((tc) => tc.toolName === "Edit").length;
    const bashCalls = toolCalls.filter((tc) => tc.toolName === "Bash").length;
    const parts: string[] = [];
    if (filesCreated > 0) parts.push(`${filesCreated} file(s) created`);
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) edited`);
    if (bashCalls > 0) parts.push(`${bashCalls} command(s) run`);
    if (parts.length === 0)
      return (
        fullResponse.split("\n").find((l) => l.trim()) ?? "Analysis complete"
      ).slice(0, 120);
    return parts.join(", ");
  }
}
