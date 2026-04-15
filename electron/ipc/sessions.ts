import { ipcMain } from "electron";
import type { SessionManager } from "../../server/services/sessions.js";
import type { ProjectManager } from "../../server/services/projects.js";
import {
  SESSIONS_LIST,
  SESSIONS_GET,
  SESSIONS_CREATE,
  SESSIONS_RENAME,
  SESSIONS_DELETE,
} from "./channels.js";

function resolveProject(
  projectManager: ProjectManager,
  projectId: string,
): string {
  const project = projectManager.get(projectId);
  if (!project) throw new Error("Project not found");
  return project.id;
}

export function setupSessionsIPC(
  sessionManager: SessionManager,
  projectManager: ProjectManager,
) {
  ipcMain.handle(
    SESSIONS_LIST,
    (_e, data: { projectId: string; limit?: number; offset?: number }) => {
      const id = resolveProject(projectManager, data.projectId);
      const items = sessionManager.listSessions(id, data.limit, data.offset);
      const total = sessionManager.countSessions(id);
      return { items, total };
    },
  );

  ipcMain.handle(SESSIONS_GET, (_e, data: { id: string }) => {
    const session = sessionManager.getSession(data.id);
    if (!session) throw new Error("Session not found");
    return session;
  });

  ipcMain.handle(
    SESSIONS_CREATE,
    (_e, data: { projectId: string; name?: string }) => {
      const id = resolveProject(projectManager, data.projectId);
      return sessionManager.createSession(id, data.name);
    },
  );

  ipcMain.handle(SESSIONS_RENAME, (_e, data: { id: string; name: string }) => {
    const session = sessionManager.renameSession(data.id, data.name);
    if (!session) throw new Error("Session not found");
    return session;
  });

  ipcMain.handle(SESSIONS_DELETE, (_e, data: { id: string }) => {
    const deleted = sessionManager.deleteSession(data.id);
    if (!deleted) throw new Error("Session not found");
    return null;
  });
}
