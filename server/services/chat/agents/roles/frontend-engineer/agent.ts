import { DecomposableAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class FrontendEngineerAgent extends DecomposableAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Guidelines for this task:",
      "- FIRST: Read the project to identify the frontend framework, styling approach, and design system. Match its conventions exactly.",
      "- If a design artifact (HTML/CSS file) is referenced, READ IT FIRST. Use the HTML comments and handoff notes to guide your component splits and prop contracts.",
      "- Modularize: one component per file. Non-trivial components get a folder with components/, hooks/, and an index barrel. Logic in hooks/composables, UI in component files.",
      "- Match the existing component patterns, naming conventions, and file structure exactly.",
      "- Use the project's existing UI library and design tokens — do not introduce new styling approaches.",
      "- Use proper types for all props, state, and API responses where the project uses a type system.",
      "- Handle loading, error, and empty states in every component that fetches data.",
      "- If this requires a backend change, describe the API contract needed but do not modify backend code.",
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

    const parts: string[] = [];
    if (filesCreated > 0) parts.push(`${filesCreated} file(s) created`);
    if (filesEdited > 0) parts.push(`${filesEdited} file(s) edited`);

    if (parts.length === 0) {
      const firstLine =
        fullResponse.split("\n").find((l) => l.trim()) ?? "Analysis complete";
      return firstLine.slice(0, 120);
    }

    return parts.join(", ");
  }
}
