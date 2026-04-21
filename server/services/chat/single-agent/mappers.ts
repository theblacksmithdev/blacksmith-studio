import type {
  StoredMessage,
  StoredMessageAttachment,
  ToolCall,
} from "../../../types.js";
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

function parseAttachments(
  raw: string | null,
): StoredMessageAttachment[] | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
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
    attachments: parseAttachments(row.attachments ?? null),
    costUsd: row.costUsd ?? undefined,
    durationMs: row.durationMs ?? undefined,
    tokens: mapTokens(row),
    model: row.model ?? undefined,
    error: row.error ?? undefined,
    timestamp: row.timestamp,
  };
}

function mapTokens(row: MessageRow) {
  if (
    row.tokensInput == null &&
    row.tokensOutput == null &&
    row.tokensCacheRead == null &&
    row.tokensCacheCreation == null
  ) {
    return undefined;
  }
  return {
    input: row.tokensInput ?? 0,
    output: row.tokensOutput ?? 0,
    cacheRead: row.tokensCacheRead ?? 0,
    cacheCreation: row.tokensCacheCreation ?? 0,
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
