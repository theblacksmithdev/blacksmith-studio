import { api as raw } from '../client'
import type { FileNode, FileContentInput, FileContentResult, FilesChangedEvent } from '../types'

export interface SearchResult {
  path: string
  name: string
  matches: { line: number; text: string }[]
}

export const files = {
  tree: () => raw.invoke<FileNode>('files:tree'),
  content: (input: FileContentInput) => raw.invoke<FileContentResult>('files:content', input),
  search: (query: string, maxResults?: number) => raw.invoke<SearchResult[]>('files:search', { query, maxResults }),

  onChanged: (cb: (data: FilesChangedEvent) => void) => raw.subscribe('files:onChanged', cb),
} as const
