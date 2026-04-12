import { api as raw } from '../client'
import type { FileNode, FileContentInput, FileContentResult, FilesChangedEvent } from '../types'

export interface SearchResult {
  path: string
  name: string
  matches: { line: number; text: string }[]
}

export interface DetectedEditor {
  id: string
  name: string
  command: string
}

export const files = {
  tree: () => raw.invoke<FileNode>('files:tree'),
  content: (input: FileContentInput) => raw.invoke<FileContentResult>('files:content', input),
  search: (query: string, maxResults?: number) => raw.invoke<SearchResult[]>('files:search', { query, maxResults }),
  reveal: (path: string) => raw.invoke<void>('files:reveal', { path }),
  detectEditors: () => raw.invoke<DetectedEditor[]>('files:detectEditors'),
  openInEditor: (path: string, command?: string) => raw.invoke<void>('files:openInEditor', { path, command }),
  save: (path: string, content: string) => raw.invoke<void>('files:save', { path, content }),
  rename: (path: string, newName: string) => raw.invoke<{ newPath: string }>('files:rename', { path, newName }),
  delete: (path: string) => raw.invoke<void>('files:delete', { path }),

  onChanged: (cb: (data: FilesChangedEvent) => void) => raw.subscribe('files:onChanged', cb),
} as const
