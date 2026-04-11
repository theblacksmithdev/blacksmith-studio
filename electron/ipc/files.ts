import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import { buildFileTree, readFileContent, searchFileContents } from '../../server/services/files.js'
import { FILES_TREE, FILES_CONTENT, FILES_SEARCH } from './channels.js'

export function setupFilesIPC(projectManager: ProjectManager) {
  ipcMain.handle(FILES_TREE, () => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project.')
    return buildFileTree(projectPath)
  })

  ipcMain.handle(FILES_CONTENT, (_e, data: { path: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project.')
    if (!data.path) throw new Error('path is required')
    return readFileContent(projectPath, data.path)
  })

  ipcMain.handle(FILES_SEARCH, (_e, data: { query: string; maxResults?: number }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project.')
    if (!data.query) return []
    return searchFileContents(projectPath, data.query, data.maxResults)
  })
}
