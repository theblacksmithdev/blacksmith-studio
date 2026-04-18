/**
 * Shared types for the Context MCP server. Tool input shapes are kept
 * narrow on purpose — each corresponds 1:1 with a JSON Schema passed to
 * Claude so the model can't pass extra fields.
 */

export interface QueryConversationHistoryInput {
  conversationId: string;
  scope: "single_chat" | "agent_chat";
  limit?: number;
}

export interface QueryDispatchTasksInput {
  dispatchId: string;
}

export interface QueryTaskOutputInput {
  taskId: string;
}

export interface SearchMessagesInput {
  query: string;
  conversationId?: string;
  scope?: "single_chat" | "agent_chat";
  limit?: number;
}

export interface ListSessionsInput {
  projectId: string;
  limit?: number;
}

export interface ListConversationsInput {
  projectId: string;
  limit?: number;
}

export interface SaveNoteInput {
  taskId: string;
  authorRole: string;
  content: string;
}

export interface ContextToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
