import { DecomposableAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class DatabaseEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Database guidelines:",
      "- Review existing models and relationships before making changes.",
      "- Write reversible migrations with meaningful names.",
      "- Add appropriate indexes for known query patterns.",
      "- Enforce data integrity at the database level (constraints, foreign keys).",
      "- For large table changes, use a safe multi-step migration strategy.",
      "- Run makemigrations and migrate after schema changes.",
    ].join("\n");
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const migrations = toolCalls.filter(
      (tc) =>
        (tc.toolName === "Write" || tc.toolName === "Edit") &&
        typeof tc.input.file_path === "string" &&
        tc.input.file_path.includes("migration"),
    ).length;

    const models = toolCalls.filter(
      (tc) =>
        (tc.toolName === "Write" || tc.toolName === "Edit") &&
        typeof tc.input.file_path === "string" &&
        tc.input.file_path.includes("models"),
    ).length;

    const parts: string[] = [];
    if (models > 0) parts.push(`${models} model file(s) modified`);
    if (migrations > 0) parts.push(`${migrations} migration(s) created`);

    if (parts.length === 0) {
      const firstLine =
        fullResponse.split("\n").find((l) => l.trim()) ??
        "Database analysis complete";
      return firstLine.slice(0, 120);
    }

    return parts.join(", ");
  }
}
