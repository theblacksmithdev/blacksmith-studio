import type { AgentRole, AgentConfig } from "../types.js";
import type { Ai } from "../../ai/ai.js";

/** Options passed to BaseAgent.execute() */
export interface AgentExecuteOptions {
  prompt: string;
  projectRoot: string;
  /**
   * The AI router — owns provider selection and spawning. Optional for now
   * while legacy call sites (base-agent, planner, assess) still spawn the
   * Claude CLI directly; new call sites (pm-dispatcher) require it.
   */
  ai?: Ai;
  /** Supply an existing session ID to resume a multi-turn conversation */
  sessionId?: string;
  /** If true and sessionId is provided, resume the session instead of creating a new one */
  resume?: boolean;
  /** Claude CLI binary path (resolved by ClaudeManager — legacy; prefer `ai`) */
  claudeBin?: string;
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
