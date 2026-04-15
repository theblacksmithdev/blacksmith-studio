import { BaseAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class ProductManagerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Product management guidelines:",
      "- Read the existing codebase to understand current capabilities before specifying new features.",
      "- Break features into user stories with clear acceptance criteria.",
      "- Include task breakdown with complexity estimates and dependency ordering.",
      "- Define the MVP scope — what's the smallest shippable increment?",
      "- Flag edge cases and open questions that need team discussion.",
    ].join("\n");
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    // Count user stories if present
    const storyCount = (fullResponse.match(/as a .+?, I want/gi) || []).length;
    const docsWritten = toolCalls.filter(
      (tc) => tc.toolName === "Write",
    ).length;

    const parts: string[] = [];
    if (storyCount > 0) parts.push(`${storyCount} user story/stories defined`);
    if (docsWritten > 0) parts.push(`${docsWritten} spec doc(s) created`);

    if (parts.length === 0) {
      const firstLine =
        fullResponse.split("\n").find((l) => l.trim()) ??
        "Product analysis complete";
      return firstLine.slice(0, 120);
    }

    return parts.join(", ");
  }
}
