import { api as raw } from '../client'

export interface TerminalSpawnInput { projectId: string; cwd?: string; cols?: number; rows?: number }
export interface TerminalOutputEvent { id: string; data: string }
export interface TerminalExitEvent { id: string; code: number }

export const terminal = {
  spawn: (input: TerminalSpawnInput) => raw.invoke<string>('terminal:spawn', input),
  write: (id: string, data: string) => raw.invoke<void>('terminal:write', { id, data }),
  resize: (id: string, cols: number, rows: number) => raw.invoke<void>('terminal:resize', { id, cols, rows }),
  kill: (id: string) => raw.invoke<void>('terminal:kill', { id }),

  onOutput: (cb: (data: TerminalOutputEvent) => void) => raw.subscribe('terminal:onOutput', cb),
  onExit: (cb: (data: TerminalExitEvent) => void) => raw.subscribe('terminal:onExit', cb),
} as const
