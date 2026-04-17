import { eq, desc } from "drizzle-orm";
import { agentConversations } from "../../../db/schema.js";
import type { Database } from "../types.js";
import type { ConversationRow } from "../mappers.js";

/**
 * DB access for the `agent_conversations` table.
 *
 * Single Responsibility: row-level CRUD. No cross-table joins live here —
 * "count messages per conversation" belongs to a higher layer that can
 * fan out to the chat-message repository.
 */
export class ConversationRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    id: string;
    projectId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }): void {
    this.db.insert(agentConversations).values(row).run();
  }

  findById(id: string): ConversationRow | null {
    return (
      this.db
        .select()
        .from(agentConversations)
        .where(eq(agentConversations.id, id))
        .get() ?? null
    );
  }

  listByProject(projectId: string, limit: number): ConversationRow[] {
    return this.db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.projectId, projectId))
      .orderBy(desc(agentConversations.updatedAt))
      .limit(limit)
      .all();
  }

  rename(id: string, title: string): void {
    this.db
      .update(agentConversations)
      .set({ title, updatedAt: new Date().toISOString() })
      .where(eq(agentConversations.id, id))
      .run();
  }

  touch(id: string): void {
    this.db
      .update(agentConversations)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(agentConversations.id, id))
      .run();
  }

  remove(id: string): void {
    this.db
      .delete(agentConversations)
      .where(eq(agentConversations.id, id))
      .run();
  }
}
