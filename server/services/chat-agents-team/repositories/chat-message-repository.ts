import { eq, and } from "drizzle-orm";
import { agentChatMessages } from "../../../db/schema.js";
import type { Database } from "../types.js";
import type { ChatMessageRow } from "../mappers.js";

/**
 * DB access for the `agent_chat_messages` table.
 *
 * Single Responsibility: row-level CRUD for chat messages. The conversation
 * touch that happens alongside every write lives in the service layer —
 * this class does not know other tables exist.
 */
export class ChatMessageRepository {
  constructor(private readonly db: Database) {}

  insert(row: {
    id: string;
    projectId: string;
    role: string;
    agentRole: string | null;
    content: string;
    conversationId: string | null;
    dispatchId: string | null;
    timestamp: string;
  }): void {
    this.db.insert(agentChatMessages).values(row).run();
  }

  listByProject(
    projectId: string,
    conversationId: string | undefined,
    limit: number,
  ): ChatMessageRow[] {
    const condition = conversationId
      ? and(
          eq(agentChatMessages.projectId, projectId),
          eq(agentChatMessages.conversationId, conversationId),
        )
      : eq(agentChatMessages.projectId, projectId);

    return this.db
      .select()
      .from(agentChatMessages)
      .where(condition)
      .orderBy(agentChatMessages.timestamp)
      .limit(limit)
      .all();
  }

  countByConversation(conversationId: string): number {
    return this.db
      .select()
      .from(agentChatMessages)
      .where(eq(agentChatMessages.conversationId, conversationId))
      .all().length;
  }

  deleteByProject(projectId: string): void {
    this.db
      .delete(agentChatMessages)
      .where(eq(agentChatMessages.projectId, projectId))
      .run();
  }
}
