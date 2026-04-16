import { BaseAgent, type ToolCallRecord } from "../../base/index.js";
import type { AgentRoleDefinition, AgentExecution } from "../../types.js";
import { DEFINITION } from "./definition.js";

export class UiDesignerAgent extends BaseAgent {
  get definition(): AgentRoleDefinition {
    return DEFINITION;
  }

  protected transformPrompt(prompt: string): string {
    return [
      prompt,
      "",
      "Design handoff guidelines:",
      "- FIRST: Read the project's theme/token files (theme.ts, tokens.ts, variables.css, tailwind.config, etc.) to discover the existing design system. Never assume or hardcode values.",
      "- Use the project's exact CSS variable names and values — do not rename or invent your own tokens.",
      "- Produce a complete, self-contained HTML/CSS file as a design artifact.",
      "- Include all component states: default, hover, focus, active, disabled, loading, error, empty, success.",
      "- Add HTML comments marking component boundaries for the Frontend Engineer.",
      "- End the file with a Frontend Engineer Handoff Notes comment block.",
      "- The Frontend Engineer will convert your HTML/CSS into the project's frontend framework — make it precise enough that zero design decisions are needed on their part.",
    ].join("\n");
  }

  protected processResult(
    _execution: AgentExecution,
    fullResponse: string,
    toolCalls: ToolCallRecord[],
  ): string {
    const specsWritten = toolCalls.filter(
      (tc) => tc.toolName === "Write",
    ).length;

    if (specsWritten > 0) return `${specsWritten} design spec(s) written`;

    const firstLine =
      fullResponse.split("\n").find((l) => l.trim()) ?? "Design spec complete";
    return firstLine.slice(0, 120);
  }
}
