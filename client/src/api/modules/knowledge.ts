import { api as raw } from '../client'

export interface KnowledgeDoc {
  name: string
  size: number
  updatedAt: string
}

export interface KnowledgeDocContent {
  name: string
  content: string
}

export const knowledge = {
  list: (projectId: string) => raw.invoke<KnowledgeDoc[]>('knowledge:list', { projectId }),
  get: (projectId: string, name: string) => raw.invoke<KnowledgeDocContent | null>('knowledge:get', { projectId, name }),
  save: (projectId: string, data: { name: string; content: string }) => raw.invoke<void>('knowledge:save', { projectId, ...data }),
  create: (projectId: string, name: string) => raw.invoke<void>('knowledge:create', { projectId, name }),
  remove: (projectId: string, name: string) => raw.invoke<void>('knowledge:remove', { projectId, name }),
} as const
