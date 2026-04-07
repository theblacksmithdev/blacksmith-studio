import { create } from 'zustand'

export type RunnerStatus = 'stopped' | 'starting' | 'running'
export type RunnerTarget = 'backend' | 'frontend' | 'all'

export interface LogEntry {
  source: 'backend' | 'frontend'
  line: string
  timestamp: number
}

interface RunnerState {
  backendStatus: RunnerStatus
  frontendStatus: RunnerStatus
  backendPort: number | null
  frontendPort: number | null
  logs: LogEntry[]

  setStatus: (status: {
    backend: { status: RunnerStatus; port: number | null }
    frontend: { status: RunnerStatus; port: number | null }
  }) => void
  addLog: (entry: LogEntry) => void
  clearLogs: () => void
}

const MAX_LOGS = 1000

export const useRunnerStore = create<RunnerState>((set) => ({
  backendStatus: 'stopped',
  frontendStatus: 'stopped',
  backendPort: null,
  frontendPort: null,
  logs: [],

  setStatus: (status) => set({
    backendStatus: status.backend.status,
    backendPort: status.backend.port,
    frontendStatus: status.frontend.status,
    frontendPort: status.frontend.port,
  }),

  addLog: (entry) => set((s) => ({
    logs: [...s.logs.slice(-(MAX_LOGS - 1)), entry],
  })),

  clearLogs: () => set({ logs: [] }),
}))

/* ── Derived selectors ── */

const isActive = (s: RunnerStatus) => s === 'running' || s === 'starting'

export const selectIsAnyActive = (s: RunnerState) =>
  isActive(s.backendStatus) || isActive(s.frontendStatus)

export const selectIsAnyRunning = (s: RunnerState) =>
  s.backendStatus === 'running' || s.frontendStatus === 'running'

export const selectIsAnyStarting = (s: RunnerState) =>
  s.backendStatus === 'starting' || s.frontendStatus === 'starting'

/* ── Helpers ── */

export function statusColor(status: RunnerStatus): string {
  if (status === 'running') return 'var(--studio-accent)'
  if (status === 'starting') return 'var(--studio-text-tertiary)'
  return 'var(--studio-text-muted)'
}

export function isServiceActive(status: RunnerStatus): boolean {
  return status === 'running' || status === 'starting'
}
