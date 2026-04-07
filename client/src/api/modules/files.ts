import { api as raw } from '../client'
import type { FileNode, FileContentInput, FileContentResult, FilesChangedEvent } from '../types'

export const files = {
  tree: () => raw.invoke<FileNode>('files:tree'),
  content: (input: FileContentInput) => raw.invoke<FileContentResult>('files:content', input),

  onChanged: (cb: (data: FilesChangedEvent) => void) => raw.subscribe('files:onChanged', cb),
} as const
