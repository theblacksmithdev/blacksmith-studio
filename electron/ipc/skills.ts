import { ipcMain } from 'electron'
import type { ProjectManager } from '../../server/services/projects.js'
import type { SkillsManager } from '../../server/services/skills.js'
import {
  SKILLS_LIST, SKILLS_GET, SKILLS_ADD, SKILLS_UPDATE, SKILLS_REMOVE,
} from './channels.js'

function requireProject(pm: ProjectManager): string {
  const project = pm.getActive()
  if (!project) throw new Error('No active project')
  return project.path
}

export function setupSkillsIPC(skillsManager: SkillsManager, projectManager: ProjectManager) {
  ipcMain.handle(SKILLS_LIST, () => {
    const root = requireProject(projectManager)
    return skillsManager.list(root)
  })

  ipcMain.handle(SKILLS_GET, (_e, data: { name: string }) => {
    const root = requireProject(projectManager)
    return skillsManager.get(root, data.name)
  })

  ipcMain.handle(SKILLS_ADD, (_e, data: { name: string; description: string; content: string }) => {
    const root = requireProject(projectManager)
    skillsManager.add(root, data.name, data.description, data.content)
  })

  ipcMain.handle(SKILLS_UPDATE, (_e, data: { name: string; description: string; content: string }) => {
    const root = requireProject(projectManager)
    skillsManager.update(root, data.name, data.description, data.content)
  })

  ipcMain.handle(SKILLS_REMOVE, (_e, data: { name: string }) => {
    const root = requireProject(projectManager)
    skillsManager.remove(root, data.name)
  })
}
