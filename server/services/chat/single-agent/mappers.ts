import type { StoredMessage, ToolCall } from "../../../types.js";
import type { messages, toolCalls, sessions } from "../../../db/schema.js";

type SessionRow = typeof sessions.$inferSelect;
type MessageRow = typeof messages.$inferSelect;
type ToolCallRow = typeof toolCalls.$inferSelect;

/**
 * Pure mappers from Drizzle row shapes to the application's domain types.
 *
 * Single Responsibility: row → domain translation. Kept free of DB access
 * so repositories do the fetching, these compose the shape.
 */

export function mapToolCall(row: ToolCallRow): ToolCall {
  return {
    toolId: row.toolId,
    toolName: row.toolName,
    input: JSON.parse(row.input),
    output: row.output ?? undefined,
  };
}

export function mapMessage(
  row: MessageRow,
  toolCallRows: ToolCallRow[],
): StoredMessage {
  return {
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    toolCalls:
      toolCallRows.length > 0 ? toolCallRows.map(mapToolCall) : undefined,
    timestamp: row.timestamp,
  };
}

export function mapSessionRow(row: SessionRow) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export type { SessionRow, MessageRow, ToolCallRow };
