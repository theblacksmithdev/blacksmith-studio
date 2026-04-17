import type {
  agentChatMessages,
  agentConversations,
  agentDispatches,
  agentTasks,
} from "../../../db/schema.js";
import type {
  AgentChatRecord,
  AgentDispatchRecord,
  AgentTaskRecord,
  ConversationRecord,
} from "./types.js";

type ConversationRow = typeof agentConversations.$inferSelect;
type DispatchRow = typeof agentDispatches.$inferSelect;
type TaskRow = typeof agentTasks.$inferSelect;
type ChatMessageRow = typeof agentChatMessages.$inferSelect;

/**
 * Pure row → domain mappers. Kept free of DB access so every SQL call
 * goes through a repository and these only coerce shapes + parse numeric
 * strings that arrive as text columns.
 */

export function mapConversation(row: ConversationRow): ConversationRecord {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapTask(row: TaskRow): AgentTaskRecord {
  return {
    id: row.id,
    dispatchId: row.dispatchId,
    title: row.title,
    role: row.role,
    prompt: row.prompt,
    status: row.status,
    orderIndex: row.orderIndex,
    executionId: row.executionId ?? null,
    sessionId: row.sessionId ?? null,
    responseText: row.responseText ?? null,
    error: row.error ?? null,
    costUsd: parseFloat(row.costUsd ?? "0") || 0,
    durationMs: row.durationMs ?? 0,
  };
}

export function mapDispatch(
  row: DispatchRow,
  taskRows: TaskRow[],
): AgentDispatchRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    prompt: row.prompt,
    planMode: row.planMode,
    planSummary: row.planSummary,
    status: row.status,
    totalCostUsd: parseFloat(row.totalCostUsd) || 0,
    totalDurationMs: row.totalDurationMs,
    createdAt: row.createdAt,
    completedAt: row.completedAt ?? null,
    tasks: taskRows.map(mapTask),
  };
}

export function mapChatMessage(row: ChatMessageRow): AgentChatRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    role: row.role,
    agentRole: row.agentRole ?? null,
    content: row.content,
    dispatchId: row.dispatchId ?? null,
    timestamp: row.timestamp,
  };
}

export type { ConversationRow, DispatchRow, TaskRow, ChatMessageRow };
