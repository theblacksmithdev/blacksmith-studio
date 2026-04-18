/**
 * Shared types for the unified conversation_events log. These back the
 * reload-fidelity replay AND the forever-kept diagnostic trail.
 *
 * `payload` is a discriminated union keyed on `eventType`; the repository
 * stores it as JSON and the service is responsible for (de)serialization.
 */

export type EventScope = "single_chat" | "agent_chat";

export type EventType =
  | "user_message"
  | "assistant_message"
  | "tool_use"
  | "tool_result"
  | "thinking_block"
  | "dispatch_created"
  | "dispatch_plan"
  | "dispatch_status"
  | "task_created"
  | "task_status_change"
  | "task_result"
  | "agent_activity"
  | "error";

export interface ConversationEvent {
  id: string;
  projectId: string;
  scope: EventScope;
  conversationId: string;
  dispatchId: string | null;
  taskId: string | null;
  messageId: string | null;
  agentRole: string | null;
  eventType: EventType;
  payload: unknown;
  sequence: number;
  timestamp: string;
}

export interface AppendConversationEventInput {
  projectId: string;
  scope: EventScope;
  conversationId: string;
  eventType: EventType;
  payload: unknown;
  dispatchId?: string | null;
  taskId?: string | null;
  messageId?: string | null;
  agentRole?: string | null;
}

export interface ListConversationEventsInput {
  scope: EventScope;
  conversationId: string;
  afterSequence?: number;
  limit?: number;
}
