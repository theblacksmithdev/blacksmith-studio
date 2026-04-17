import type { StoredMessage } from "../../../types.js";
import type {
  MessageRepository,
  SessionRepository,
  ToolCallRepository,
} from "../repositories/index.js";

/**
 * Writes a message into a session atomically: the row itself, any tool
 * calls it produced, and a touch on the parent session's `updatedAt`.
 *
 * Single Responsibility: the append-to-session write path. Read paths
 * live in SessionService; cross-session analyses live in ArtifactTracer.
 */
export class MessageService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
    private readonly toolCalls: ToolCallRepository,
  ) {}

  add(sessionId: string, message: StoredMessage): void {
    this.messages.insert({
      id: message.id,
      sessionId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    });

    if (message.toolCalls) {
      for (const tc of message.toolCalls) {
        this.toolCalls.insert({
          messageId: message.id,
          toolId: tc.toolId,
          toolName: tc.toolName,
          input: JSON.stringify(tc.input),
          output: tc.output ?? null,
        });
      }
    }

    this.sessions.touch(sessionId);
  }
}
