import { eq, desc, and } from "drizzle-orm";
import { agentDispatches, agentTasks } from "../../../db/schema.js";
import type { Database } from "../types.js";
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

  /**
   * Find the most recent Claude session used by a given role in a project.
   * Joins dispatches (for project scoping + recency) with tasks (for role
   * + status). Returns null if no completed task by that role exists.
   */
  findLatestSessionForRole(
    projectId: string,
    role: string,
  ): string | null {
    const row = this.db
      .select({ sessionId: agentTasks.sessionId })
      .from(agentTasks)
      .innerJoin(
        agentDispatches,
        eq(agentTasks.dispatchId, agentDispatches.id),
      )
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
}
