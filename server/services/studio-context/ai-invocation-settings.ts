import type { McpManager } from "../mcp.js";
import type { Project } from "../projects.js";
import type { SettingsManager } from "../settings.js";
import { ensureContextMcpRegistered } from "../agents/context-mcp/index.js";

/**
 * Shared per-invocation settings shape consumed by both chat types.
 *
 * The multi-agent pipeline (AgentExecuteOptions) and the single-agent
 * chat (AiStreamOptions) map this struct into their own option shapes —
 * this type is the least-common-denominator that both features actually
 * need to read from project settings.
 */
export interface AiInvocationSettings {
  projectRoot: string;
  nodePath: string | undefined;
  mcpConfigPath: string | undefined;
  permissionMode: string | undefined;
  /** Per-project custom instructions appended to the system prompt. */
  customInstructions: string | undefined;
  /** Preferred model ID for the session (single-agent chat only today). */
  model: string | undefined;
  /** Max budget in USD for the session (single-agent chat only today). */
  maxBudget: number | null | undefined;
}

/**
 * Read the project's AI invocation settings from the settings manager
 * and resolve the MCP config path + nodePath. A single source of truth
 * so the multi-agent and single-agent chats can't drift on which keys
 * they honour or how they're coerced.
 */
export function resolveAiInvocationSettings(
  project: Project,
  settingsManager: SettingsManager,
  mcpManager: McpManager,
): AiInvocationSettings {
  const all = settingsManager.getAll(project.id);
  const disabledServers = Array.isArray(all["mcp.disabledServers"])
    ? (all["mcp.disabledServers"] as string[])
    : [];
  const nodePath =
    settingsManager.resolve(project.id, "runner.nodePath") || undefined;

  // Keep the built-in Context MCP server in sync with the compiled
  // subprocess path on every invocation. Cheap (one JSON rewrite if
  // stale, no-op otherwise) and guarantees agents always have the
  // tool available.
  ensureContextMcpRegistered(mcpManager, project.path, nodePath);

  return {
    projectRoot: project.path,
    nodePath,
    mcpConfigPath: mcpManager.getEnabledConfigPath(
      project.path,
      disabledServers,
    ),
    permissionMode:
      (all["ai.permissionMode"] as string | undefined) || undefined,
    customInstructions:
      (all["ai.customInstructions"] as string | undefined) || undefined,
    model: (all["ai.model"] as string | undefined) || undefined,
    maxBudget: (all["ai.maxBudget"] as number | null | undefined) ?? undefined,
  };
}
