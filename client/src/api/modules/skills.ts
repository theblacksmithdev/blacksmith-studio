import { api as raw } from '../client'

export interface SkillEntry {
  name: string
  description: string
  content: string
}

export const skills = {
  list: (projectId: string) => raw.invoke<SkillEntry[]>('skills:list', { projectId }),
  get: (projectId: string, name: string) => raw.invoke<SkillEntry | null>('skills:get', { projectId, name }),
  add: (projectId: string, data: { name: string; description: string; content: string }) => raw.invoke<void>('skills:add', { projectId, ...data }),
  update: (projectId: string, data: { name: string; description: string; content: string }) => raw.invoke<void>('skills:update', { projectId, ...data }),
  remove: (projectId: string, name: string) => raw.invoke<void>('skills:remove', { projectId, name }),
} as const
