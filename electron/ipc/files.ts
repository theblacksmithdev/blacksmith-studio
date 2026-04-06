import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import { buildFileTree, readFileContent } from '../../server/services/files.js'
import { FILES_TREE, FILES_CONTENT } from './channels.js'

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
}
