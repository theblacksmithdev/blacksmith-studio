import { getDatabase } from "../../db/index.js";
import type { Session, SessionSummary, StoredMessage } from "../../types.js";
import { ArtifactTracer } from "./artifact-tracer.js";
import { FileToolParser } from "./file-tool-parser.js";
import {
  MessageRepository,
  SessionRepository,
  ToolCallRepository,
} from "./repositories/index.js";
import { MessageService, SessionService } from "./services/index.js";
import type { ConversationArtifact, Database } from "./types.js";

/**
 * Facade over the session subsystem.
 *
 * Single Responsibility: composition + delegation. Every public method
 * routes to exactly one collaborator. The facade itself holds zero SQL
 * and zero domain logic.
 *
 * Dependency Inversion: accepts a Database handle (defaulting to the
 * shared Drizzle singleton). Callers that want an isolated database —
 * tests, multi-tenant shards — pass their own.
 *
 * Public API is preserved byte-for-byte with the pre-refactor
 * SessionManager so IPC handlers don't change.
 */
export class SessionManager {
  private readonly sessions: SessionService;
  private readonly messages: MessageService;
  private readonly tracer: ArtifactTracer;

  constructor(db: Database = getDatabase()) {
    const sessionRepo = new SessionRepository(db);
    const messageRepo = new MessageRepository(db);
    const toolCallRepo = new ToolCallRepository(db);
    const parser = new FileToolParser();

    this.sessions = new SessionService(sessionRepo, messageRepo, toolCallRepo);
    this.messages = new MessageService(sessionRepo, messageRepo, toolCallRepo);
    this.tracer = new ArtifactTracer(db, messageRepo, toolCallRepo, parser);
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

  addMessage(sessionId: string, message: StoredMessage): void {
    this.messages.add(sessionId, message);
  }

  /* ── Cross-domain tracing ── */

  getConversationArtifacts(conversationId: string): ConversationArtifact[] {
    return this.tracer.getArtifacts(conversationId);
  }
}
