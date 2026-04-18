import { eq, inArray } from "drizzle-orm";
import { taskDependencies } from "../../../../db/schema.js";
import type { Database } from "../../../../db/index.js";

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

/**
 * DB access for the `task_dependencies` join table.
 *
 * Single Responsibility: edges of the task DAG. The task-lifecycle
 * service composes this with TaskRepository to answer "can this task
 * start yet" questions; the repository itself knows only about rows.
 */
export class TaskDependencyRepository {
  constructor(private readonly db: Database) {}

  insert(row: TaskDependency): void {
    this.db.insert(taskDependencies).values(row).onConflictDoNothing().run();
  }

  insertMany(rows: TaskDependency[]): void {
    if (rows.length === 0) return;
    this.db.insert(taskDependencies).values(rows).onConflictDoNothing().run();
  }

  /** Tasks that `taskId` depends on (prerequisites). */
  listDependenciesOf(taskId: string): TaskDependency[] {
    return this.db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, taskId))
      .all();
  }

  /** Tasks that depend on `taskId` (downstream consumers). */
  listDependentsOf(taskId: string): TaskDependency[] {
    return this.db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.dependsOnTaskId, taskId))
      .all();
  }

  listForTasks(taskIds: string[]): TaskDependency[] {
    if (taskIds.length === 0) return [];
    return this.db
      .select()
      .from(taskDependencies)
      .where(inArray(taskDependencies.taskId, taskIds))
      .all();
  }

  removeAllFor(taskId: string): void {
    this.db
      .delete(taskDependencies)
      .where(eq(taskDependencies.taskId, taskId))
      .run();
  }
}
