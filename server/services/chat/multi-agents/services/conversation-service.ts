import crypto from "node:crypto";
import { mapConversation } from "../mappers.js";
import type {
  ChatMessageRepository,
  ConversationRepository,
} from "../repositories/index.js";
import type {
  ConversationRecord,
  ConversationSummary,
} from "../types.js";

/**
 * High-level operations on agent conversations.
 *
 * Single Responsibility: conversation lifecycle (create, list, read,
 * rename, touch, delete). Enriches listings with message counts by
 * fanning out to the chat-message repository — the conversation
 * repository itself stays pure.
 */
export class ConversationService {
  constructor(
    private readonly conversations: ConversationRepository,
    private readonly chatMessages: ChatMessageRepository,
  ) {}

  create(projectId: string, title?: string): ConversationRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const convTitle =
      title || `Conversation ${new Date().toLocaleDateString()}`;

    this.conversations.insert({
      id,
      projectId,
      title: convTitle,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      title: convTitle,
      pmSessionId: null,
      lastPlanSummary: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  list(projectId: string, limit = 50): ConversationSummary[] {
    return this.conversations.listByProject(projectId, limit).map((row) => ({
      ...mapConversation(row),
      messageCount: this.chatMessages.countByConversation(row.id),
    }));
  }

  getById(id: string): ConversationRecord | null {
    const row = this.conversations.findById(id);
    return row ? mapConversation(row) : null;
  }

  rename(id: string, title: string): void {
    this.conversations.rename(id, title);
  }

  touch(id: string): void {
    this.conversations.touch(id);
  }

  /** Persist the PM's Claude session id — called once, on the first dispatch. */
  setPMSession(id: string, pmSessionId: string): void {
    this.conversations.setPMSession(id, pmSessionId);
  }

  /** Cache the latest PM plan summary on the conversation. */
  setLastPlanSummary(id: string, summary: string): void {
    this.conversations.setLastPlanSummary(id, summary);
  }

  remove(id: string): void {
    this.conversations.remove(id);
  }
}
