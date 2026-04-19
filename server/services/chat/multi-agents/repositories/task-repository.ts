import { eq, desc, and, inArray } from "drizzle-orm";
import { agentDispatches, agentTasks } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";
import type { TaskRow } from "../mappers.js";

export interface TaskInsert {
  id: string;
  dispatchId: string;
  title: string;
  description: string | null;
  role: string;
  prompt: string;
  status: string;
  taskType: string;
  orderIndex: number;
  parentTaskId?: string;
}

export interface TaskUpdate {
  status?: string;
  executionId?: string;
  sessionId?: string;
  responseText?: string;
  error?: string;
  costUsd?: string;
  durationMs?: number;
  startedAt?: string;
  finishedAt?: string;
}

/**
 * DB access for the `agent_tasks` table, plus the cross-table lookup
 * that finds the most recent session a given role used in a project.
 *
 * Single Responsibility: everything keyed on `agent_tasks`. The join
 * against `agent_dispatches` lives here (not in DispatchRepository)
 * because the query's *target* data is a task session — dispatches are
 * just the filter predicate.
 */
export class TaskRepository {
  constructor(private readonly db: Database) {}

  insert(row: TaskInsert): void {
    this.db
      .insert(agentTasks)
      .values({
        id: row.id,
        dispatchId: row.dispatchId,
        title: row.title,
        description: row.description,
        role: row.role,
        prompt: row.prompt,
        status: row.status,
        taskType: row.taskType,
        orderIndex: row.orderIndex,
        parentTaskId: row.parentTaskId,
      })
      .run();
  }

  update(id: string, patch: TaskUpdate): void {
    if (Object.keys(patch).length === 0) return;
    this.db.update(agentTasks).set(patch).where(eq(agentTasks.id, id)).run();
  }

  listByDispatch(dispatchId: string): TaskRow[] {
    return this.db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.dispatchId, dispatchId))
      .orderBy(agentTasks.orderIndex)
      .all();
  }

  findById(id: string): TaskRow | null {
    return (
      this.db.select().from(agentTasks).where(eq(agentTasks.id, id)).get() ??
      null
    );
  }

  /**
   * Return the (sessionId, role) pairs for every task in a set of
   * dispatches that actually ran a Claude session. Tasks without a
   * session (never executed, cancelled pre-spawn, ...) are filtered
   * out at the SQL boundary.
   */
  findSessionLinksByDispatches(
    dispatchIds: string[],
  ): { sessionId: string; role: string }[] {
    if (dispatchIds.length === 0) return [];
    return this.db
      .select({ sessionId: agentTasks.sessionId, role: agentTasks.role })
      .from(agentTasks)
      .where(inArray(agentTasks.dispatchId, dispatchIds))
      .all()
      .filter(
        (t): t is { sessionId: string; role: string } =>
          typeof t.sessionId === "string" && t.sessionId.length > 0,
      );
  }

  /**
   * Find the most recent Claude session used by a given role *within a
   * single conversation*. Scoped by `conversationId` so agents resume their
   * own prior work in this thread without leaking context from other chats.
   */
  findLatestSessionForRoleInConversation(
    conversationId: string,
    role: string,
  ): string | null {
    const row = this.db
      .select({ sessionId: agentTasks.sessionId })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(
        and(
          eq(agentDispatches.conversationId, conversationId),
          eq(agentTasks.role, role),
          eq(agentTasks.status, "done"),
        ),
      )
      .orderBy(desc(agentDispatches.createdAt))
      .limit(1)
      .get();

    return row?.sessionId ?? null;
  }
}
