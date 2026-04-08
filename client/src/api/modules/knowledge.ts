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
  list: () => raw.invoke<KnowledgeDoc[]>('knowledge:list'),
  get: (data: { name: string }) => raw.invoke<KnowledgeDocContent | null>('knowledge:get', data),
  save: (data: { name: string; content: string }) => raw.invoke<void>('knowledge:save', data),
  create: (data: { name: string }) => raw.invoke<void>('knowledge:create', data),
  remove: (data: { name: string }) => raw.invoke<void>('knowledge:remove', data),
} as const
