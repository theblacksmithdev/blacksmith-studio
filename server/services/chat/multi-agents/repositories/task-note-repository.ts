import { asc, eq, inArray } from "drizzle-orm";
import { taskNotes } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";

type TaskNoteRow = typeof taskNotes.$inferSelect;

export interface TaskNoteInsert {
  id: string;
  taskId: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

/**
 * DB access for the `task_notes` table.
 *
 * Single Responsibility: row-level CRUD on agent-authored breadcrumbs
 * attached to a task. The Context MCP write tool `save_note` composes
 * this (via NoteService) with authorization checks.
 */
export class TaskNoteRepository {
  constructor(private readonly db: Database) {}

  insert(row: TaskNoteInsert): void {
    this.db.insert(taskNotes).values(row).run();
  }

  listForTask(taskId: string): TaskNoteRow[] {
    return this.db
      .select()
      .from(taskNotes)
      .where(eq(taskNotes.taskId, taskId))
      .orderBy(asc(taskNotes.createdAt))
      .all();
  }

  listForTasks(taskIds: string[]): TaskNoteRow[] {
    if (taskIds.length === 0) return [];
    return this.db
      .select()
      .from(taskNotes)
      .where(inArray(taskNotes.taskId, taskIds))
      .orderBy(asc(taskNotes.createdAt))
      .all();
  }

  remove(id: string): void {
    this.db.delete(taskNotes).where(eq(taskNotes.id, id)).run();
  }
}
