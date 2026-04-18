import crypto from "node:crypto";
import { mapChatMessage } from "../mappers.js";
import type { ChatMessageRepository } from "../repositories/index.js";
import type { AgentChatRecord, ChatAttachmentInput } from "../types.js";
import type { ConversationService } from "./conversation-service.js";

/**
 * Writes and reads chat messages, with a side-effect: every write
 * touches its parent conversation so conversation-list ordering stays
 * consistent.
 *
 * Single Responsibility: chat-message I/O plus the conversation-touch
 * contract. Delegates to the chat-message repository for DB work and
 * the ConversationService for the touch.
 */
export class ChatService {
  constructor(
    private readonly messages: ChatMessageRepository,
    private readonly conversations: ConversationService,
  ) {}

  add(
    projectId: string,
    role: string,
    content: string,
    agentRole?: string,
    dispatchId?: string,
    conversationId?: string,
    attachments?: ChatAttachmentInput[],
  ): AgentChatRecord {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const attachmentsJson =
      attachments && attachments.length > 0
        ? JSON.stringify(attachments)
        : null;

    this.messages.insert({
      id,
      projectId,
      role,
      agentRole: agentRole ?? null,
      content,
      attachments: attachmentsJson,
      conversationId: conversationId ?? null,
      dispatchId: dispatchId ?? null,
      timestamp,
    });

    if (conversationId) this.conversations.touch(conversationId);

    return {
      id,
      projectId,
      role,
      agentRole: agentRole ?? null,
      content,
      attachments: attachments && attachments.length > 0 ? attachments : null,
      dispatchId: dispatchId ?? null,
      timestamp,
    };
  }

  list(
    projectId: string,
    conversationId?: string,
    limit = 200,
  ): AgentChatRecord[] {
    return this.messages
      .listByProject(projectId, conversationId, limit)
      .map(mapChatMessage);
  }

  clear(projectId: string): void {
    this.messages.deleteByProject(projectId);
  }
}
