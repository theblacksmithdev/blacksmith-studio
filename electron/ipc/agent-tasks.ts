import { ipcMain } from "electron";
import type { AgentSessionManager } from "../../server/services/chat/multi-agents/index.js";
import {
  AGENT_TASKS_LIST,
  AGENT_TASKS_GET,
  AGENT_TASK_NOTES_LIST,
  AGENT_TASK_NOTES_ADD,
  AGENT_TASK_DEPENDENCIES_LIST,
} from "./channels.js";

/**
 * IPC handlers for the persisted Agent Team task model.
 *
 * Reads the `agent_tasks`, `task_dependencies`, and `task_notes` tables
 * through the session manager's narrow read paths. Writes are limited
 * to appending notes — task status transitions are driven by the agent
 * runtime (multi-agents.ts) and reach the UI via the unified
 * conversation-events push stream.
 */
export function setupAgentTasksIPC(
  sessionManager: AgentSessionManager,
): void {
  ipcMain.handle(AGENT_TASKS_LIST, (_e, data: { dispatchId: string }) => {
    const dispatch = sessionManager.getDispatch(data.dispatchId);
    return dispatch ? dispatch.tasks : [];
  });

  ipcMain.handle(AGENT_TASKS_GET, (_e, data: { taskId: string }) => {
    const ctx = sessionManager.resolveTaskContext(data.taskId);
    if (!ctx) return null;
    const dispatch = sessionManager.getDispatch(ctx.dispatchId);
    return dispatch?.tasks.find((t) => t.id === data.taskId) ?? null;
  });

  ipcMain.handle(AGENT_TASK_NOTES_LIST, (_e, data: { taskId: string }) =>
    sessionManager.listTaskNotes(data.taskId),
  );

  ipcMain.handle(
    AGENT_TASK_NOTES_ADD,
    (
      _e,
      data: { taskId: string; authorRole: string; content: string },
    ) =>
      sessionManager.addTaskNote(data.taskId, data.authorRole, data.content),
  );

  ipcMain.handle(
    AGENT_TASK_DEPENDENCIES_LIST,
    (_e, data: { dispatchId: string }) =>
      sessionManager.listDependenciesForDispatch(data.dispatchId),
  );
}
