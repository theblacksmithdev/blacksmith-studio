import { ipcMain } from 'electron'
import type { SessionManager } from '../../server/services/sessions.js'
import type { ProjectManager } from '../../server/services/projects.js'
import {
  SESSIONS_LIST, SESSIONS_GET, SESSIONS_CREATE, SESSIONS_RENAME, SESSIONS_DELETE,
} from './channels.js'

function requireActiveProject(projectManager: ProjectManager): string {
  const project = projectManager.getActive()
  if (!project) throw new Error('No active project. Select or create a project first.')
  return project.id
}

export function setupSessionsIPC(sessionManager: SessionManager, projectManager: ProjectManager) {
  ipcMain.handle(SESSIONS_LIST, () => {
    const projectId = requireActiveProject(projectManager)
    return sessionManager.listSessions(projectId)
  })

  ipcMain.handle(SESSIONS_GET, (_e, data: { id: string }) => {
    const session = sessionManager.getSession(data.id)
    if (!session) throw new Error('Session not found')
    return session
  })

  ipcMain.handle(SESSIONS_CREATE, (_e, data?: { name?: string }) => {
    const projectId = requireActiveProject(projectManager)
    return sessionManager.createSession(projectId, data?.name)
  })

  ipcMain.handle(SESSIONS_RENAME, (_e, data: { id: string; name: string }) => {
    const session = sessionManager.renameSession(data.id, data.name)
    if (!session) throw new Error('Session not found')
    return session
  })

  ipcMain.handle(SESSIONS_DELETE, (_e, data: { id: string }) => {
    const deleted = sessionManager.deleteSession(data.id)
    if (!deleted) throw new Error('Session not found')
    return null
  })
}
