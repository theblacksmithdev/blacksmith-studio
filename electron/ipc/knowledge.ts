import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { KnowledgeManager } from '../../server/services/knowledge.js'
import {
  KNOWLEDGE_LIST, KNOWLEDGE_GET, KNOWLEDGE_SAVE, KNOWLEDGE_CREATE, KNOWLEDGE_REMOVE,
} from './channels.js'

function requireProject(pm: ProjectManager): string {
  const project = pm.getActive()
  if (!project) throw new Error('No active project')
  return project.path
}

export function setupKnowledgeIPC(knowledgeManager: KnowledgeManager, projectManager: ProjectManager) {
  ipcMain.handle(KNOWLEDGE_LIST, () => {
    const root = requireProject(projectManager)
    return knowledgeManager.list(root)
  })

  ipcMain.handle(KNOWLEDGE_GET, (_e, data: { name: string }) => {
    const root = requireProject(projectManager)
    return knowledgeManager.get(root, data.name)
  })

  ipcMain.handle(KNOWLEDGE_SAVE, (_e, data: { name: string; content: string }) => {
    const root = requireProject(projectManager)
    knowledgeManager.save(root, data.name, data.content)
  })

  ipcMain.handle(KNOWLEDGE_CREATE, (_e, data: { name: string }) => {
    const root = requireProject(projectManager)
    knowledgeManager.create(root, data.name)
  })

  ipcMain.handle(KNOWLEDGE_REMOVE, (_e, data: { name: string }) => {
    const root = requireProject(projectManager)
    knowledgeManager.remove(root, data.name)
  })
}
