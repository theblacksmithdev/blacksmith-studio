import crypto from "node:crypto";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getDatabase } from "../db/index.js";
import {
  sessions,
  messages,
  toolCalls,
  agentDispatches,
  agentTasks,
} from "../db/schema.js";
import type {
  Session,
  SessionSummary,
  StoredMessage,
  ToolCall,
} from "../types.js";

export class SessionManager {
  constructor() {
    getDatabase();
  }

  private get db() {
    return getDatabase();
  }

  createSession(projectId: string, name?: string): Session {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const sessionName = name || `Session ${new Date().toLocaleDateString()}`;

    this.db
      .insert(sessions)
      .values({
        id,
        projectId,
        name: sessionName,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return {
      id,
      name: sessionName,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
  }

  getSession(id: string): Session | null {
    const row = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();
    if (!row) return null;

    const msgs = this.db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, id))
      .orderBy(messages.timestamp)
      .all();

    const sessionMessages: StoredMessage[] = msgs.map((msg) => {
      const tcs = this.db
        .select()
        .from(toolCalls)
        .where(eq(toolCalls.messageId, msg.id))
        .all();

      const mappedToolCalls: ToolCall[] | undefined =
        tcs.length > 0
          ? tcs.map((tc) => ({
              toolId: tc.toolId,
              toolName: tc.toolName,
              input: JSON.parse(tc.input),
              output: tc.output ?? undefined,
            }))
          : undefined;

      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        toolCalls: mappedToolCalls,
        timestamp: msg.timestamp,
      };
    });

    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      messages: sessionMessages,
    };
  }

  listSessions(
    projectId: string,
    limit?: number,
    offset?: number,
  ): SessionSummary[] {
    let query = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .orderBy(desc(sessions.updatedAt));

    if (limit != null) query = query.limit(limit) as typeof query;
    if (offset != null) query = query.offset(offset) as typeof query;

    const rows = query.all();

    return rows.map((row) => {
      const msgCount = this.db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, row.id))
        .all().length;

      const lastUserMsg = this.db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, row.id))
        .orderBy(desc(messages.timestamp))
        .all()
        .find((m) => m.role === "user");

      return {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        messageCount: msgCount,
        lastPrompt: lastUserMsg?.content,
      };
    });
  }

  countSessions(projectId: string): number {
    return this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, projectId))
      .all().length;
  }

  addMessage(sessionId: string, message: StoredMessage): void {
    this.db
      .insert(messages)
      .values({
        id: message.id,
        sessionId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      })
      .run();

    if (message.toolCalls) {
      for (const tc of message.toolCalls) {
        this.db
          .insert(toolCalls)
          .values({
            messageId: message.id,
            toolId: tc.toolId,
            toolName: tc.toolName,
            input: JSON.stringify(tc.input),
            output: tc.output ?? null,
          })
          .run();
      }
    }

    this.db
      .update(sessions)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, sessionId))
      .run();
  }

  renameSession(id: string, name: string): Session | null {
    const existing = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();
    if (!existing) return null;
    this.db
      .update(sessions)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(sessions.id, id))
      .run();
    return this.getSession(id);
  }

  deleteSession(id: string): boolean {
    const existing = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .get();
    if (!existing) return false;
    this.db.delete(sessions).where(eq(sessions.id, id)).run();
    return true;
  }

  /**
   * Get all files changed by agents in a conversation.
   * Traces: conversationId → dispatches → tasks → sessions → messages → tool_calls
   * Extracts file paths from Edit/Write/Read tool inputs.
   */
  getConversationArtifacts(
    conversationId: string,
  ): { path: string; tool: string; role: string; timestamp: string }[] {
    const FILE_TOOLS = ["Edit", "Write", "NotebookEdit"];

    // Get all dispatches for this conversation
    const dispatches = this.db
      .select({ id: agentDispatches.id })
      .from(agentDispatches)
      .where(eq(agentDispatches.conversationId, conversationId))
      .all();

    if (dispatches.length === 0) return [];

    // Get all tasks with session IDs
    const tasks = this.db
      .select({
        sessionId: agentTasks.sessionId,
        role: agentTasks.role,
      })
      .from(agentTasks)
      .where(
        inArray(
          agentTasks.dispatchId,
          dispatches.map((d) => d.id),
        ),
      )
      .all()
      .filter((t) => t.sessionId);

    if (tasks.length === 0) return [];

    const artifacts: {
      path: string;
      tool: string;
      role: string;
      timestamp: string;
    }[] = [];
    const seenPaths = new Set<string>();

    for (const task of tasks) {
      // Get all messages for this session
      const msgs = this.db
        .select({ id: messages.id, timestamp: messages.timestamp })
        .from(messages)
        .where(eq(messages.sessionId, task.sessionId!))
        .all();

      if (msgs.length === 0) continue;

      // Get tool calls for these messages
      const tcs = this.db
        .select()
        .from(toolCalls)
        .where(
          inArray(
            toolCalls.messageId,
            msgs.map((m) => m.id),
          ),
        )
        .all();

      for (const tc of tcs) {
        if (!FILE_TOOLS.includes(tc.toolName)) continue;

        try {
          const input = JSON.parse(tc.input);
          const filePath = input.file_path || input.path;
          if (!filePath || seenPaths.has(filePath)) continue;

          seenPaths.add(filePath);
          const msg = msgs.find((m) => m.id === tc.messageId);
          artifacts.push({
            path: filePath,
            tool: tc.toolName,
            role: task.role,
            timestamp: msg?.timestamp ?? "",
          });
        } catch {
          /* skip unparseable */
        }
      }
    }

    return artifacts.sort((a, b) => a.path.localeCompare(b.path));
  }
}
