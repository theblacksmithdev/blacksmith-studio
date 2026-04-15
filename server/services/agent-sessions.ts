import crypto from "node:crypto";
import { eq, desc, and } from "drizzle-orm";
import { getDatabase } from "../db/index.js";
import {
  agentConversations,
  agentDispatches,
  agentTasks,
  agentChatMessages,
} from "../db/schema.js";

/* ── Types ── */

export interface AgentDispatchRecord {
  id: string;
  projectId: string;
  prompt: string;
  planMode: string;
  planSummary: string;
  status: string;
  totalCostUsd: number;
  totalDurationMs: number;
  createdAt: string;
  completedAt: string | null;
  tasks: AgentTaskRecord[];
}

export interface AgentTaskRecord {
  id: string;
  dispatchId: string;
  title: string;
  role: string;
  prompt: string;
  status: string;
  orderIndex: number;
  executionId: string | null;
  sessionId: string | null;
  responseText: string | null;
  error: string | null;
  costUsd: number;
  durationMs: number;
}

export interface AgentChatRecord {
  id: string;
  projectId: string;
  role: string;
  agentRole: string | null;
  content: string;
  dispatchId: string | null;
  timestamp: string;
}

/* ── Service ── */

export class AgentSessionManager {
  constructor() {
    getDatabase();
  }

  private get db() {
    return getDatabase();
  }

  /* ── Conversations ── */

  createConversation(
    projectId: string,
    title?: string,
  ): { id: string; title: string; createdAt: string; updatedAt: string } {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const convTitle =
      title || `Conversation ${new Date().toLocaleDateString()}`;

    this.db
      .insert(agentConversations)
      .values({
        id,
        projectId,
        title: convTitle,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return { id, title: convTitle, createdAt: now, updatedAt: now };
  }

  listConversations(
    projectId: string,
    limit = 50,
  ): {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
  }[] {
    const rows = this.db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.projectId, projectId))
      .orderBy(desc(agentConversations.updatedAt))
      .limit(limit)
      .all();

    return rows.map((row) => {
      const msgCount = this.db
        .select()
        .from(agentChatMessages)
        .where(eq(agentChatMessages.conversationId, row.id))
        .all().length;

      return { ...row, messageCount: msgCount };
    });
  }

  getConversation(conversationId: string): {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  } | null {
    return (
      this.db
        .select()
        .from(agentConversations)
        .where(eq(agentConversations.id, conversationId))
        .get() ?? null
    );
  }

  updateConversationTitle(conversationId: string, title: string): void {
    this.db
      .update(agentConversations)
      .set({ title, updatedAt: new Date().toISOString() })
      .where(eq(agentConversations.id, conversationId))
      .run();
  }

  touchConversation(conversationId: string): void {
    this.db
      .update(agentConversations)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(agentConversations.id, conversationId))
      .run();
  }

  deleteConversation(conversationId: string): void {
    this.db
      .delete(agentConversations)
      .where(eq(agentConversations.id, conversationId))
      .run();
  }

  /* ── Dispatches ── */

  createDispatch(
    projectId: string,
    prompt: string,
    planMode: string,
    planSummary: string,
    tasks: {
      id: string;
      title: string;
      description?: string;
      role: string;
      prompt: string;
    }[],
    conversationId?: string,
  ): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db
      .insert(agentDispatches)
      .values({
        id,
        projectId,
        conversationId: conversationId ?? null,
        prompt,
        planMode,
        planSummary,
        status: "executing",
        totalCostUsd: "0",
        totalDurationMs: 0,
        createdAt: now,
      })
      .run();

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      this.db
        .insert(agentTasks)
        .values({
          id: task.id,
          dispatchId: id,
          title: task.title,
          description: task.description ?? null,
          role: task.role,
          prompt: task.prompt,
          status: "pending",
          taskType: "main",
          orderIndex: i,
        })
        .run();
    }

    return id;
  }

  /** Persist decomposed sub-tasks linked to a parent task */
  addSubTasks(
    dispatchId: string,
    parentTaskId: string,
    subtasks: {
      id: string;
      title: string;
      description?: string;
      prompt: string;
      role: string;
    }[],
  ): void {
    for (let i = 0; i < subtasks.length; i++) {
      const sub = subtasks[i];
      this.db
        .insert(agentTasks)
        .values({
          id: sub.id,
          dispatchId,
          title: sub.title,
          description: sub.description ?? null,
          role: sub.role,
          prompt: sub.prompt,
          status: "pending",
          taskType: "subtask",
          parentTaskId,
          orderIndex: i,
        })
        .run();
    }
  }

  updateDispatchStatus(
    dispatchId: string,
    status: string,
    totalCostUsd?: number,
    totalDurationMs?: number,
  ): void {
    const updates: Record<string, any> = { status };
    if (totalCostUsd != null) updates.totalCostUsd = String(totalCostUsd);
    if (totalDurationMs != null) updates.totalDurationMs = totalDurationMs;
    if (
      status === "completed" ||
      status === "failed" ||
      status === "cancelled"
    ) {
      updates.completedAt = new Date().toISOString();
    }

    this.db
      .update(agentDispatches)
      .set(updates)
      .where(eq(agentDispatches.id, dispatchId))
      .run();
  }

  updateTaskStatus(
    taskId: string,
    status: string,
    data?: {
      executionId?: string;
      sessionId?: string;
      responseText?: string;
      error?: string;
      costUsd?: number;
      durationMs?: number;
    },
  ): void {
    const updates: Record<string, any> = { status };
    if (data?.executionId) updates.executionId = data.executionId;
    if (data?.sessionId) updates.sessionId = data.sessionId;
    if (data?.responseText) updates.responseText = data.responseText;
    if (data?.error) updates.error = data.error;
    if (data?.costUsd != null) updates.costUsd = String(data.costUsd);
    if (data?.durationMs != null) updates.durationMs = data.durationMs;

    this.db
      .update(agentTasks)
      .set(updates)
      .where(eq(agentTasks.id, taskId))
      .run();
  }

  getDispatch(dispatchId: string): AgentDispatchRecord | null {
    const row = this.db
      .select()
      .from(agentDispatches)
      .where(eq(agentDispatches.id, dispatchId))
      .get();
    if (!row) return null;

    const taskRows = this.db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.dispatchId, dispatchId))
      .orderBy(agentTasks.orderIndex)
      .all();

    return {
      ...row,
      totalCostUsd: parseFloat(row.totalCostUsd) || 0,
      completedAt: row.completedAt ?? null,
      tasks: taskRows.map((t) => ({
        ...t,
        executionId: t.executionId ?? null,
        sessionId: t.sessionId ?? null,
        responseText: t.responseText ?? null,
        error: t.error ?? null,
        costUsd: parseFloat(t.costUsd ?? "0") || 0,
        durationMs: t.durationMs ?? 0,
      })),
    };
  }

  listDispatches(projectId: string, limit = 50): AgentDispatchRecord[] {
    const rows = this.db
      .select()
      .from(agentDispatches)
      .where(eq(agentDispatches.projectId, projectId))
      .orderBy(desc(agentDispatches.createdAt))
      .limit(limit)
      .all();

    return rows.map((row) => {
      const taskRows = this.db
        .select()
        .from(agentTasks)
        .where(eq(agentTasks.dispatchId, row.id))
        .orderBy(agentTasks.orderIndex)
        .all();

      return {
        ...row,
        totalCostUsd: parseFloat(row.totalCostUsd) || 0,
        completedAt: row.completedAt ?? null,
        tasks: taskRows.map((t) => ({
          ...t,
          executionId: t.executionId ?? null,
          responseText: t.responseText ?? null,
          error: t.error ?? null,
          costUsd: parseFloat(t.costUsd ?? "0") || 0,
          durationMs: t.durationMs ?? 0,
        })),
      };
    });
  }

  /**
   * Get the most recent Claude session ID used by a given role in this project.
   * Used to resume agent sessions across dispatches.
   */
  getLatestSessionForRole(projectId: string, role: string): string | null {
    // Find the most recent completed task for this role in this project
    const row = this.db
      .select({ sessionId: agentTasks.sessionId })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(
        and(
          eq(agentDispatches.projectId, projectId),
          eq(agentTasks.role, role),
          eq(agentTasks.status, "done"),
        ),
      )
      .orderBy(desc(agentDispatches.createdAt))
      .limit(1)
      .get();

    return row?.sessionId ?? null;
  }

  /**
   * Get a summary of recent dispatches for context injection into the PM.
   * Returns the last N dispatches with their task summaries.
   */
  getRecentDispatchContext(projectId: string, limit = 5): string {
    const dispatches = this.listDispatches(projectId, limit);
    if (dispatches.length === 0) return "";

    const lines: string[] = ["## Recent Work History\n"];

    for (const d of dispatches) {
      const status = d.status === "completed" ? "done" : d.status;
      lines.push(`### ${d.planSummary} (${status})`);
      lines.push(`Prompt: ${d.prompt.slice(0, 150)}`);
      for (const t of d.tasks) {
        const icon =
          t.status === "done"
            ? "done"
            : t.status === "error"
              ? "failed"
              : t.status;
        lines.push(`  - [${icon}] ${t.title} (${t.role})`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /* ── Chat Messages ── */

  addChatMessage(
    projectId: string,
    role: string,
    content: string,
    agentRole?: string,
    dispatchId?: string,
    conversationId?: string,
  ): AgentChatRecord {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    this.db
      .insert(agentChatMessages)
      .values({
        id,
        projectId,
        role,
        agentRole: agentRole ?? null,
        content,
        conversationId: conversationId ?? null,
        dispatchId: dispatchId ?? null,
        timestamp,
      })
      .run();

    // Touch conversation to update its updatedAt
    if (conversationId) this.touchConversation(conversationId);

    return {
      id,
      projectId,
      role,
      agentRole: agentRole ?? null,
      content,
      dispatchId: dispatchId ?? null,
      timestamp,
    };
  }

  listChatMessages(
    projectId: string,
    conversationId?: string,
    limit = 200,
  ): AgentChatRecord[] {
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
      .all()
      .map((row) => ({
        ...row,
        agentRole: row.agentRole ?? null,
        dispatchId: row.dispatchId ?? null,
      }));
  }

  clearChatMessages(projectId: string): void {
    this.db
      .delete(agentChatMessages)
      .where(eq(agentChatMessages.projectId, projectId))
      .run();
  }
}
