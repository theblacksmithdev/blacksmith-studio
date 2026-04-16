import { STUDIO_SYSTEM_PROMPT } from "../../claude/system-prompt.js";
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

/** Build the Claude CLI argument array */
export function buildCliArgs(params: {
  sessionId: string;
  isResume: boolean;
  prompt: string;
  systemPrompt: string;
  definition: AgentRoleDefinition;
  options: AgentExecuteOptions;
}): string[] {
  const { sessionId, isResume, prompt, systemPrompt, definition, options } =
    params;
  const config = options.agentConfig;

  const args = [
    "-p",
    prompt,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    options.permissionMode ?? definition.permissionMode,
    "--include-partial-messages",
    "--append-system-prompt",
    systemPrompt,
  ];

  if (isResume) {
    args.push("--resume", sessionId);
  } else {
    args.push("--session-id", sessionId);
  }

  // Enforce tool restrictions from role definition
  if (
    Array.isArray(definition.allowedTools) &&
    definition.allowedTools.length > 0
  ) {
    args.push("--allowedTools", definition.allowedTools.join(","));
  }

  const model = config?.model ?? definition.preferredModel;
  if (model) args.push("--model", model);

  const budget = config?.maxBudget ?? definition.maxBudget;
  if (budget != null && budget > 0)
    args.push("--max-budget-usd", String(budget));

  if (options.mcpConfigPath) args.push("--mcp-config", options.mcpConfigPath);

  return args;
}
