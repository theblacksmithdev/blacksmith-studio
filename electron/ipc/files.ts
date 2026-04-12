import fs from 'node:fs'
import path from 'node:path'
import { ipcMain, shell } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import { buildFileTree, readFileContent, writeFileContent, searchFileContents } from '../../server/services/files.js'
import { detectEditors, openInEditor } from '../../server/services/editors.js'
import {
  FILES_TREE, FILES_CONTENT, FILES_SEARCH,
  FILES_REVEAL, FILES_OPEN_IN_EDITOR, FILES_DETECT_EDITORS,
  FILES_SAVE, FILES_RENAME, FILES_DELETE,
} from './channels.js'

export function setupFilesIPC(projectManager: ProjectManager) {
  ipcMain.handle(FILES_TREE, () => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    return buildFileTree(projectPath)
  })

  ipcMain.handle(FILES_CONTENT, (_e, data: { path: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    if (!data.path) throw new Error('path is required')
    return readFileContent(projectPath, data.path)
  })

  ipcMain.handle(FILES_SEARCH, (_e, data: { query: string; maxResults?: number }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    if (!data.query) return []
    return searchFileContents(projectPath, data.query, data.maxResults)
  })

  ipcMain.handle(FILES_REVEAL, (_e, data: { path: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    const fullPath = path.resolve(projectPath, data.path)
    shell.showItemInFolder(fullPath)
  })

  ipcMain.handle(FILES_DETECT_EDITORS, () => {
    return detectEditors()
  })

  ipcMain.handle(FILES_OPEN_IN_EDITOR, (_e, data: { path: string; command?: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    const fullPath = path.resolve(projectPath, data.path)
    openInEditor(data.command || 'code', fullPath)
  })

  ipcMain.handle(FILES_SAVE, (_e, data: { path: string; content: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    if (!data.path) throw new Error('path is required')
    writeFileContent(projectPath, data.path, data.content)
  })

  ipcMain.handle(FILES_RENAME, (_e, data: { path: string; newName: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    const oldFull = path.resolve(projectPath, data.path)
    if (!oldFull.startsWith(projectPath)) throw new Error('This path is outside the project directory and can\'t be accessed.')
    const newFull = path.resolve(path.dirname(oldFull), data.newName)
    if (!newFull.startsWith(projectPath)) throw new Error('This path is outside the project directory and can\'t be accessed.')
    fs.renameSync(oldFull, newFull)
    return { newPath: path.relative(projectPath, newFull) }
  })

  ipcMain.handle(FILES_DELETE, (_e, data: { path: string }) => {
    const projectPath = projectManager.getActivePath()
    if (!projectPath) throw new Error('No active project. Open a project first.')
    const fullPath = path.resolve(projectPath, data.path)
    if (!fullPath.startsWith(projectPath)) throw new Error('This path is outside the project directory and can\'t be accessed.')
    fs.rmSync(fullPath, { recursive: true })
  })
}
