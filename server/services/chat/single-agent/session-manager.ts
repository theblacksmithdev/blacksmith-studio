import { getDatabase, type Database } from "../../../db/index.js";
import type { Session, SessionSummary, StoredMessage } from "../../../types.js";
import {
  MessageRepository,
  SessionRepository,
  ToolCallRepository,
} from "./repositories/index.js";
import { SessionService } from "./services/index.js";

/**
 * Facade over the single-chat session subsystem.
 *
 * Single Responsibility: composition + delegation for single-chat
 * persistence (sessions / messages / tool_calls). Cross-domain work
 * like "what files did agents touch during this conversation?" lives
 * in agent-sessions/ — its input is an agent conversation ID, so
 * that's where it belongs.
 *
 * Dependency Inversion: accepts a Database handle (defaulting to the
 * shared Drizzle singleton) — tests inject an in-memory instance.
 */
export class SessionManager {
  private readonly sessionRepo: SessionRepository;
  private readonly messageRepo: MessageRepository;
  private readonly toolCallRepo: ToolCallRepository;
  private readonly sessions: SessionService;

  constructor(db: Database = getDatabase()) {
    this.sessionRepo = new SessionRepository(db);
    this.messageRepo = new MessageRepository(db);
    this.toolCallRepo = new ToolCallRepository(db);
    this.sessions = new SessionService(
      this.sessionRepo,
      this.messageRepo,
      this.toolCallRepo,
    );
  }

  /* ── Sessions ── */

  createSession(projectId: string, name?: string): Session {
    return this.sessions.create(projectId, name);
  }

  getSession(id: string): Session | null {
    return this.sessions.getById(id);
  }

  listSessions(
    projectId: string,
    limit?: number,
    offset?: number,
  ): SessionSummary[] {
    return this.sessions.list(projectId, limit, offset);
  }

  countSessions(projectId: string): number {
    return this.sessions.count(projectId);
  }

  renameSession(id: string, name: string): Session | null {
    return this.sessions.rename(id, name);
  }

  deleteSession(id: string): boolean {
    return this.sessions.remove(id);
  }

  /* ── Messages ── */

  /**
   * Append a message to a session. Writes the message row, fans out any
   * tool-call rows, and touches the parent session's `updatedAt` — the
   * three-repo dance is kept inline here because it's a single write path
   * and wrapping it in a service adds indirection without clarity.
   */
  addMessage(sessionId: string, message: StoredMessage): void {
    // Inherit the session's last-known model for assistant turns that
    // arrive without one (rare — errored turns, provider hiccups). Keeps
    // the context meter anchored to a real model instead of regressing
    // to "Unknown".
    const model =
      message.model ??
      (message.role === "assistant"
        ? this.messageRepo.findLastModel(sessionId)
        : null);

    this.messageRepo.insert({
      id: message.id,
      sessionId,
      role: message.role,
      content: message.content,
      attachments:
        message.attachments && message.attachments.length > 0
          ? JSON.stringify(message.attachments)
          : null,
      costUsd: message.costUsd ?? null,
      durationMs: message.durationMs ?? null,
      tokensInput: message.tokens?.input ?? null,
      tokensOutput: message.tokens?.output ?? null,
      tokensCacheRead: message.tokens?.cacheRead ?? null,
      tokensCacheCreation: message.tokens?.cacheCreation ?? null,
      model,
      error: message.error ?? null,
      timestamp: message.timestamp,
    });

    if (message.toolCalls) {
      for (const tc of message.toolCalls) {
        this.toolCallRepo.insert({
          messageId: message.id,
          toolId: tc.toolId,
          toolName: tc.toolName,
          input: JSON.stringify(tc.input),
          output: tc.output ?? null,
        });
      }
    }

    this.sessionRepo.touch(sessionId);
  }
}
