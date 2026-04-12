import { create } from 'zustand'

export type RunnerStatus = 'stopped' | 'starting' | 'running'

export interface RunnerService {
  id: string
  name: string
  status: RunnerStatus
  port: number | null
  previewUrl: string | null
  icon: string
}

export interface LogEntry {
  configId: string
  name: string
  line: string
  timestamp: number
}

interface RunnerState {
  services: RunnerService[]
  logs: LogEntry[]

  setServices: (services: RunnerService[]) => void
  updateService: (id: string, partial: Partial<RunnerService>) => void
  addLog: (entry: LogEntry) => void
  clearLogs: () => void
}

const MAX_LOGS = 1000

export const useRunnerStore = create<RunnerState>((set) => ({
  services: [],
  logs: [],

  setServices: (services) => set({ services }),

  updateService: (id, partial) => set((s) => ({
    services: s.services.map((svc) =>
      svc.id === id ? { ...svc, ...partial } : svc,
    ),
  })),

  addLog: (entry) => set((s) => ({
    logs: [...s.logs.slice(-(MAX_LOGS - 1)), entry],
  })),

  clearLogs: () => set({ logs: [] }),
}))

/* ── Derived selectors ── */

export const selectServices = (s: RunnerState) => s.services

export const selectIsAnyActive = (s: RunnerState) =>
  s.services.some((svc) => svc.status === 'running' || svc.status === 'starting')

export const selectIsAnyRunning = (s: RunnerState) =>
  s.services.some((svc) => svc.status === 'running')

export const selectIsAnyStarting = (s: RunnerState) =>
  s.services.some((svc) => svc.status === 'starting')

export const selectRunningCount = (s: RunnerState) =>
  s.services.filter((svc) => svc.status === 'running' || svc.status === 'starting').length

export const selectPreviewServices = (s: RunnerState) =>
  s.services.filter((svc) => svc.previewUrl && svc.status === 'running')

/* ── Helpers ── */

export function statusColor(status: RunnerStatus): string {
  if (status === 'running') return 'var(--studio-accent)'
  if (status === 'starting') return 'var(--studio-text-tertiary)'
  return 'var(--studio-text-muted)'
}

export function isServiceActive(status: RunnerStatus): boolean {
  return status === 'running' || status === 'starting'
}
