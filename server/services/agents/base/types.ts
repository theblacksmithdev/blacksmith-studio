import type { AgentRole, AgentConfig } from "../types.js";

/** Options passed to BaseAgent.execute() */
export interface AgentExecuteOptions {
  prompt: string;
  projectRoot: string;
  /** Supply an existing session ID to resume a multi-turn conversation */
  sessionId?: string;
  /** If true and sessionId is provided, resume the session instead of creating a new one */
  resume?: boolean;
  /** Claude CLI binary path (resolved by ClaudeManager) */
  claudeBin?: string;
  /** Node binary path for correct PATH resolution */
  nodePath?: string;
  /** MCP config file path */
  mcpConfigPath?: string;
  /** Per-project custom instructions from settings */
  projectInstructions?: string;
  /** Per-agent config overrides from settings */
  agentConfig?: AgentConfig;
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
