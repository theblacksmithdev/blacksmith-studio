import { STUDIO_SYSTEM_PROMPT } from "../../../studio-context/index.js";
import type { AgentRoleDefinition } from "../types.js";
import type { AgentExecuteOptions } from "./types.js";

/** Build the full system prompt with role, project, and agent instructions layered */
export function buildSystemPrompt(
  definition: AgentRoleDefinition,
  options: AgentExecuteOptions,
): string {
  const parts = [
    STUDIO_SYSTEM_PROMPT,
    `\n\n## Agent Role: ${definition.title}\n\n${definition.systemPrompt}`,
  ];

  if (options.projectInstructions) {
    parts.push(`\n\n## Project Instructions\n\n${options.projectInstructions}`);
  }

  if (options.agentConfig?.customInstructions) {
    parts.push(
      `\n\n## Additional Agent Instructions\n\n${options.agentConfig.customInstructions}`,
    );
  }

  return parts.join("");
}
