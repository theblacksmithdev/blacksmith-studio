import { and, desc, eq, like, or } from "drizzle-orm";
import type { Database } from "../../../db/index.js";
import type { AgentSessionManager } from "../../chat/multi-agents/index.js";
import type { SessionManager } from "../../chat/single-agent/index.js";
import {
  agentChatMessages,
  agentConversations,
  messages,
  sessions,
} from "../../../db/schema.js";
import type {
  ListConversationsInput,
  ListSessionsInput,
  QueryConversationHistoryInput,
  QueryDispatchTasksInput,
  QueryTaskOutputInput,
  SearchMessagesInput,
} from "./types.js";

/**
 * Read-side of the Context MCP server.
 *
 * Single Responsibility: translate MCP tool invocations into narrow
 * reads against the persistence layer. All business logic stays here
 * so the `ContextMcpServer` wrapper remains a thin JSON-RPC transport.
 *
 * Dependency Inversion: constructor-injects the session managers + a
 * Drizzle handle. Each read method returns a plain object ready to be
 * JSON-serialized back to Claude.
 */
export class ContextQueryService {
  constructor(
    private readonly db: Database,
    private readonly sessionManager: SessionManager,
    private readonly agentSessionManager: AgentSessionManager,
  ) {}

  queryConversationHistory(input: QueryConversationHistoryInput) {
    const limit = input.limit ?? 50;
    if (input.scope === "single_chat") {
      const session = this.sessionManager.getSession(input.conversationId);
      if (!session) return { messages: [] };
      return {
        messages: session.messages
          .slice(-limit)
          .map(({ id, role, content, timestamp }) => ({
            id,
            role,
            content,
            timestamp,
          })),
      };
    }
    const rows = this.db
      .select()
      .from(agentChatMessages)
      .where(eq(agentChatMessages.conversationId, input.conversationId))
      .orderBy(desc(agentChatMessages.timestamp))
      .limit(limit)
      .all();
    return {
      messages: rows.reverse().map((r) => ({
        id: r.id,
        role: r.role,
        agentRole: r.agentRole,
        content: r.content,
        timestamp: r.timestamp,
      })),
    };
  }

  queryDispatchTasks(input: QueryDispatchTasksInput) {
    const dispatch = this.agentSessionManager.getDispatch(input.dispatchId);
    if (!dispatch) return { tasks: [] };
    return {
      dispatch: {
        id: dispatch.id,
        prompt: dispatch.prompt,
        planSummary: dispatch.planSummary,
        status: dispatch.status,
      },
      tasks: dispatch.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        role: t.role,
        status: t.status,
        responseText: t.responseText,
        error: t.error,
      })),
    };
  }

  queryTaskOutput(input: QueryTaskOutputInput) {
    const ctx = this.agentSessionManager.resolveTaskContext(input.taskId);
    if (!ctx) return { found: false };
    const dispatch = this.agentSessionManager.getDispatch(ctx.dispatchId);
    const task = dispatch?.tasks.find((t) => t.id === input.taskId);
    if (!task) return { found: false };
    const notes = this.agentSessionManager.listTaskNotes(input.taskId);
    return {
      found: true,
      task: {
        id: task.id,
        title: task.title,
        role: task.role,
        status: task.status,
        prompt: task.prompt,
        responseText: task.responseText,
        error: task.error,
        costUsd: task.costUsd,
        durationMs: task.durationMs,
      },
      notes: notes.map((n) => ({
        authorRole: n.authorRole,
        content: n.content,
        createdAt: n.createdAt,
      })),
    };
  }

  searchMessages(input: SearchMessagesInput) {
    const limit = input.limit ?? 20;
    const needle = `%${input.query}%`;
    const results: Array<{
      scope: "single_chat" | "agent_chat";
      conversationId: string;
      role: string;
      content: string;
      timestamp: string;
    }> = [];

    if (!input.scope || input.scope === "agent_chat") {
      const rows = this.db
        .select()
        .from(agentChatMessages)
        .where(
          input.conversationId
            ? and(
                eq(agentChatMessages.conversationId, input.conversationId),
                like(agentChatMessages.content, needle),
              )
            : like(agentChatMessages.content, needle),
        )
        .orderBy(desc(agentChatMessages.timestamp))
        .limit(limit)
        .all();
      for (const r of rows) {
        results.push({
          scope: "agent_chat",
          conversationId: r.conversationId ?? "",
          role: r.role,
          content: r.content,
          timestamp: r.timestamp,
        });
      }
    }

    if (!input.scope || input.scope === "single_chat") {
      const rows = this.db
        .select()
        .from(messages)
        .where(
          input.conversationId
            ? and(
                eq(messages.sessionId, input.conversationId),
                like(messages.content, needle),
              )
            : like(messages.content, needle),
        )
        .orderBy(desc(messages.timestamp))
        .limit(limit)
        .all();
      for (const r of rows) {
        results.push({
          scope: "single_chat",
          conversationId: r.sessionId,
          role: r.role,
          content: r.content,
          timestamp: r.timestamp,
        });
      }
    }

    results.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return { results: results.slice(0, limit) };
  }

  listSessions(input: ListSessionsInput) {
    const limit = input.limit ?? 20;
    const rows = this.db
      .select()
      .from(sessions)
      .where(eq(sessions.projectId, input.projectId))
      .orderBy(desc(sessions.updatedAt))
      .limit(limit)
      .all();
    return {
      sessions: rows.map((r) => ({
        id: r.id,
        name: r.name,
        updatedAt: r.updatedAt,
      })),
    };
  }

  listConversations(input: ListConversationsInput) {
    const limit = input.limit ?? 20;
    const rows = this.db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.projectId, input.projectId))
      .orderBy(desc(agentConversations.updatedAt))
      .limit(limit)
      .all();
    return {
      conversations: rows.map((r) => ({
        id: r.id,
        title: r.title,
        updatedAt: r.updatedAt,
        lastPlanSummary: r.lastPlanSummary,
      })),
    };
  }
}

// Silence unused-import warnings from tree-shaken operators if the
// bundler preserves them. `or` kept for future full-text cross-table
// search expansion — export it so it doesn't get dropped prematurely.
export const __drizzleOps = { or };
