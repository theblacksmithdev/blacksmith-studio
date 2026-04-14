import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SkillsManager } from '../../server/services/skills.js'
import {
  SKILLS_LIST, SKILLS_GET, SKILLS_ADD, SKILLS_UPDATE, SKILLS_REMOVE,
} from './channels.js'

function resolveProjectPath(pm: ProjectManager, projectId: string): string {
  const project = pm.get(projectId)
  if (!project) throw new Error('Project not found')
  return project.path
}

export function setupSkillsIPC(skillsManager: SkillsManager, projectManager: ProjectManager) {
  ipcMain.handle(SKILLS_LIST, (_e, data: { projectId: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    return skillsManager.list(root)
  })

  ipcMain.handle(SKILLS_GET, (_e, data: { projectId: string; name: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    return skillsManager.get(root, data.name)
  })

  ipcMain.handle(SKILLS_ADD, (_e, data: { projectId: string; name: string; description: string; content: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    skillsManager.add(root, data.name, data.description, data.content)
  })

  ipcMain.handle(SKILLS_UPDATE, (_e, data: { projectId: string; name: string; description: string; content: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    skillsManager.update(root, data.name, data.description, data.content)
  })

  ipcMain.handle(SKILLS_REMOVE, (_e, data: { projectId: string; name: string }) => {
    const root = resolveProjectPath(projectManager, data.projectId)
    skillsManager.remove(root, data.name)
  })
}
