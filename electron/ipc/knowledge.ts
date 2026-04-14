import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { KnowledgeManager } from '../../server/services/knowledge.js'
import {
  KNOWLEDGE_LIST, KNOWLEDGE_GET, KNOWLEDGE_SAVE, KNOWLEDGE_CREATE, KNOWLEDGE_REMOVE,
} from './channels.js'

function resolveProjectPath(pm: ProjectManager, projectId: string): string {
  const project = pm.get(projectId)
  if (!project) throw new Error('Project not found')
  return project.path
}

export function setupKnowledgeIPC(knowledgeManager: KnowledgeManager, projectManager: ProjectManager) {
  ipcMain.handle(KNOWLEDGE_LIST, (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    return knowledgeManager.list(root)
  })

  ipcMain.handle(KNOWLEDGE_GET, (_e, data: { projectId: string; name: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    return knowledgeManager.get(root, data.name)
  })

  ipcMain.handle(KNOWLEDGE_SAVE, (_e, data: { projectId: string; name: string; content: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    knowledgeManager.save(root, data.name, data.content)
  })

  ipcMain.handle(KNOWLEDGE_CREATE, (_e, data: { projectId: string; name: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    knowledgeManager.create(root, data.name)
  })

  ipcMain.handle(KNOWLEDGE_REMOVE, (_e, data: { projectId: string; name: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    knowledgeManager.remove(root, data.name)
  })
}
