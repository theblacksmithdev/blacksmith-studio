import { ipcMain } from 'electron'
import type { SettingsManager } from '../../server/services/settings.js'
import type { ProjectManager } from '../../server/services/projects.js'
import { SETTINGS_GET_ALL, SETTINGS_UPDATE } from './channels.js'

function requireActiveProject(projectManager: ProjectManager): string {
  const project = projectManager.getActive()
  if (!project) throw new Error('No active project. Select or create a project first.')
  return project.id
}

export function setupSettingsIPC(settingsManager: SettingsManager, projectManager: ProjectManager) {
  ipcMain.handle(SETTINGS_GET_ALL, () => {
    const projectId = requireActiveProject(projectManager)
    return settingsManager.getAll(projectId)
  })

  ipcMain.handle(SETTINGS_UPDATE, (_e, data: Record<string, any>) => {
    const projectId = requireActiveProject(projectManager)
    if (!data || typeof data !== 'object') throw new Error('Body must be a JSON object')
    settingsManager.setMany(projectId, data)
    return settingsManager.getAll(projectId)
  })
}
