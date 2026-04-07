import { api as raw } from '../client'

export interface McpServerConfig {
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export interface McpServerEntry {
  name: string
  transport: 'stdio' | 'http'
  config: McpServerConfig
  enabled: boolean
  status: 'unknown' | 'connected' | 'error' | 'disconnected'
  error?: string
}

export const mcp = {
  list: () => raw.invoke<McpServerEntry[]>('mcp:list'),
  add: (data: { name: string; config: McpServerConfig }) => raw.invoke<void>('mcp:add', data),
  update: (data: { name: string; config: McpServerConfig }) => raw.invoke<void>('mcp:update', data),
  remove: (data: { name: string }) => raw.invoke<void>('mcp:remove', data),
  toggle: (data: { name: string; enabled: boolean }) => raw.invoke<void>('mcp:toggle', data),
  test: (data: { name: string }) => raw.invoke<{ ok: boolean; error?: string }>('mcp:test', data),
} as const
