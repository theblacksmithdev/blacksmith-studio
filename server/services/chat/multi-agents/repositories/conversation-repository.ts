import { eq, desc } from "drizzle-orm";
import { agentConversations } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";
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

  /**
   * Persist the Claude CLI session id the PM uses for this conversation.
   * Only written once — the first dispatch generates the id; every later
   * dispatch passes it to Claude via --resume.
   */
  setPMSession(id: string, pmSessionId: string): void {
    this.db
      .update(agentConversations)
      .set({ pmSessionId, updatedAt: new Date().toISOString() })
      .where(eq(agentConversations.id, id))
      .run();
  }

  /** Cache the latest PM plan summary on the conversation for quick lookup. */
  setLastPlanSummary(id: string, summary: string): void {
    this.db
      .update(agentConversations)
      .set({ lastPlanSummary: summary, updatedAt: new Date().toISOString() })
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
