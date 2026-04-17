import { eq, inArray } from "drizzle-orm";
import { toolCalls } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";
import type { ToolCallRow } from "../mappers.js";

/**
 * DB access for the `tool_calls` table.
 *
 * Single Responsibility: row-level CRUD on tool-call records keyed by
 * their parent message. Tool-input JSON stays as a raw string at this
 * layer — parsing/coercion happens in the mappers.
 */
export class ToolCallRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    messageId: string;
    toolId: string;
    toolName: string;
    input: string;
    output: string | null;
  }): void {
    this.db.insert(toolCalls).values(row).run();
  }

  listByMessage(messageId: string): ToolCallRow[] {
    return this.db
      .select()
      .from(toolCalls)
      .where(eq(toolCalls.messageId, messageId))
      .all();
  }

  listByMessages(messageIds: string[]): ToolCallRow[] {
    if (messageIds.length === 0) return [];
    return this.db
      .select()
      .from(toolCalls)
      .where(inArray(toolCalls.messageId, messageIds))
      .all();
  }
}
