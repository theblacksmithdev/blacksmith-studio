import crypto from "node:crypto";
import type { Session, SessionSummary } from "../../../types.js";
import type {
  MessageRepository,
  SessionRepository,
  ToolCallRepository,
} from "../repositories/index.js";
import { mapMessage, mapSessionRow } from "../mappers.js";

/**
 * High-level session operations — create, read, rename, delete, list.
 *
 * Single Responsibility: orchestrate repositories to produce domain
 * objects. Contains zero SQL; every DB call goes through a repository.
 *
 * Dependency Inversion: repositories are injected so tests can swap
 * in-memory fakes without touching the service.
 */
export class SessionService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly messages: MessageRepository,
    private readonly toolCalls: ToolCallRepository,
  ) {}

  create(projectId: string, name?: string): Session {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const sessionName = name || `Session ${new Date().toLocaleDateString()}`;

    this.sessions.insert({
      id,
      projectId,
      name: sessionName,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      name: sessionName,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
  }

  getById(id: string): Session | null {
    const row = this.sessions.findById(id);
    if (!row) return null;

    const messageRows = this.messages.listBySession(id);
    const storedMessages = messageRows.map((msg) =>
      mapMessage(msg, this.toolCalls.listByMessage(msg.id)),
    );

    return { ...mapSessionRow(row), messages: storedMessages };
  }

  list(projectId: string, limit?: number, offset?: number): SessionSummary[] {
    const rows = this.sessions.listByProject(projectId, limit, offset);

    return rows.map((row) => ({
      ...mapSessionRow(row),
      messageCount: this.messages.countBySession(row.id),
      lastPrompt: this.messages.lastUserMessage(row.id)?.content,
    }));
  }

  count(projectId: string): number {
    return this.sessions.countByProject(projectId);
  }

  rename(id: string, name: string): Session | null {
    if (!this.sessions.findById(id)) return null;
    this.sessions.rename(id, name);
    return this.getById(id);
  }

  remove(id: string): boolean {
    if (!this.sessions.findById(id)) return false;
    this.sessions.remove(id);
    return true;
  }
}
