import type { AgentRole, AgentConfig } from "../types.js";
import type { Ai } from "../../ai/ai.js";

/** Options passed to BaseAgent.execute() */
export interface AgentExecuteOptions {
  prompt: string;
  projectRoot: string;
  /**
   * The AI router — owns provider selection and spawning. Required at
   * every active call site; marked optional only so tests and fixtures
   * can construct partial options without wiring a full Ai instance.
   */
  ai?: Ai;
  /** Supply an existing session ID to resume a multi-turn conversation */
  sessionId?: string;
  /** If true and sessionId is provided, resume the session instead of creating a new one */
  resume?: boolean;
  /** Node binary path for correct PATH resolution */
  nodePath?: string;
  /** MCP config file path */
  mcpConfigPath?: string;
  /** Per-project custom instructions from settings */
  projectInstructions?: string;
  /** Per-agent config overrides from settings */
  agentConfig?: AgentConfig;
  /** Project-level permission mode override (overrides role definition default) */
  permissionMode?: string;
}

export interface ToolCallRecord {
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
}

export interface HandoffDescriptor {
  targetRole: AgentRole;
  reason: string;
  context: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}
