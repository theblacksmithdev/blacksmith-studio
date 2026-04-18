import type { AgentSessionManager } from "../../chat/multi-agents/index.js";
import type { SaveNoteInput } from "./types.js";

/**
 * Write-side of the Context MCP server.
 *
 * Single Responsibility: authorize + execute agent-authored writes.
 * Currently limited to task notes; further write tools (e.g. task
 * annotations, dependency edits) plug in here without changing the
 * read path.
 */
export class ContextWriteService {
  constructor(private readonly agentSessionManager: AgentSessionManager) {}

  saveNote(input: SaveNoteInput) {
    const ctx = this.agentSessionManager.resolveTaskContext(input.taskId);
    if (!ctx) {
      throw new Error(`Task ${input.taskId} not found`);
    }
    const note = this.agentSessionManager.addTaskNote(
      input.taskId,
      input.authorRole,
      input.content,
    );
    return {
      id: note.id,
      taskId: note.taskId,
      authorRole: note.authorRole,
      createdAt: note.createdAt,
    };
  }
}
