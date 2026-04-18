import crypto from "node:crypto";
import {
  TaskNoteRepository,
  type TaskNoteInsert,
} from "../repositories/index.js";

export interface TaskNoteRecord {
  id: string;
  taskId: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

/**
 * Business logic for agent-authored task notes.
 *
 * Single Responsibility: write-path validation + ID/timestamp assignment
 * for `task_notes`. Exposes a narrow interface the Context MCP write
 * tool (`save_note`) composes with authorization checks.
 */
export class NoteService {
  constructor(private readonly notes: TaskNoteRepository) {}

  add(taskId: string, authorRole: string, content: string): TaskNoteRecord {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new Error("Note content cannot be empty");
    }
    const row: TaskNoteInsert = {
      id: crypto.randomUUID(),
      taskId,
      authorRole,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    this.notes.insert(row);
    return row;
  }

  listForTask(taskId: string): TaskNoteRecord[] {
    return this.notes.listForTask(taskId).map((row) => ({
      id: row.id,
      taskId: row.taskId,
      authorRole: row.authorRole,
      content: row.content,
      createdAt: row.createdAt,
    }));
  }
}
