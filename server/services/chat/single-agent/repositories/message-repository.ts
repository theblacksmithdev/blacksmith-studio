import { eq, desc, inArray } from "drizzle-orm";
import { messages } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";
import type { MessageRow } from "../mappers.js";

/**
 * DB access for the `messages` table.
 *
 * Single Responsibility: row-level CRUD on messages. Higher-level
 * operations (add-message-with-toolcalls-and-touch-session) compose
 * this with the other repositories in the service layer.
 */
export class MessageRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    id: string;
    sessionId: string;
    role: "user" | "assistant";
    content: string;
    attachments?: string | null;
    costUsd?: string | null;
    durationMs?: number | null;
    error?: string | null;
    timestamp: string;
  }): void {
    this.db.insert(messages).values(row).run();
  }

  listBySession(sessionId: string): MessageRow[] {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp)
      .all();
  }

  lastUserMessage(sessionId: string): MessageRow | undefined {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(desc(messages.timestamp))
      .all()
      .find((m) => m.role === "user");
  }

  countBySession(sessionId: string): number {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .all().length;
  }

  listBySessions(sessionIds: string[]): MessageRow[] {
    if (sessionIds.length === 0) return [];
    return this.db
      .select()
      .from(messages)
      .where(inArray(messages.sessionId, sessionIds))
      .all();
  }
}
