import { api as raw } from '../client'

export interface SkillEntry {
  name: string
  description: string
  content: string
}

export const skills = {
  list: () => raw.invoke<SkillEntry[]>('skills:list'),
  get: (data: { name: string }) => raw.invoke<SkillEntry | null>('skills:get', data),
  add: (data: { name: string; description: string; content: string }) => raw.invoke<void>('skills:add', data),
  update: (data: { name: string; description: string; content: string }) => raw.invoke<void>('skills:update', data),
  remove: (data: { name: string }) => raw.invoke<void>('skills:remove', data),
} as const
