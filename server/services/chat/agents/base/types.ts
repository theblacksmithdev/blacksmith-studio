import type { AgentRole, AgentConfig } from "../types.js";
import type { Ai } from "../../../ai/ai.js";
import type { ConversationContext } from "../manager/conversation-context.js";

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
  /**
   * Cross-agent conversation state: the original user request, prior
   * chat transcript, and the PM's persisted Claude session id. Threaded
   * from the IPC layer so the PM can resume and every downstream worker
   * can see the user's intent and the PM's overall plan — not just an
   * isolated task prompt. Optional so legacy call sites (tests, pipelines,
   * standalone workflows) continue to work.
   */
  conversationContext?: ConversationContext;
  /**
   * Optional sink called after each task's response is auto-saved to
   * `.blacksmith/artifacts/{role}/`. The IPC layer wires this to the
   * `ArtifactService` so the DB index + UI stay in sync with disk.
   * Absent in tests and standalone workflows.
   */
  onArtifactWritten?: (info: {
    role: string;
    taskId: string;
    title: string;
    relPath: string;
  }) => void;
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
