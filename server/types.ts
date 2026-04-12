/* ── Pagination ── */

export interface PaginationInput {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

/** Helper to paginate an in-memory array */
export function paginate<T>(items: T[], input?: PaginationInput): PaginatedResult<T> {
  const offset = input?.offset ?? 0
  const limit = input?.limit ?? 50
  const sliced = items.slice(offset, offset + limit)
  return {
    items: sliced,
    total: items.length,
    hasMore: offset + limit < items.length,
  }
}

/* ── Sessions ── */

export interface Session {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  messages: StoredMessage[]
}

export interface SessionSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastPrompt?: string
}

export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  timestamp: string
}

export interface ToolCall {
  toolId: string
  toolName: string
  input: Record<string, unknown>
  output?: string
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'pages' | 'api' | 'debug' | 'general'
  fields: TemplateField[]
  promptTemplate: string
}

export interface TemplateField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: string[]
  required: boolean
}

export interface HealthStatus {
  projectName: string
  projectRoot: string
  claudeInstalled: boolean
  claudeVersion?: string
}
