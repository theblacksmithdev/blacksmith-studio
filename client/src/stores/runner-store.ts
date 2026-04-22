import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export enum RunnerStatus {
  Stopped = "stopped",
  Starting = "starting",
  Running = "running",
}

export interface RunnerService {
  id: string;
  name: string;
  status: RunnerStatus;
  port: number | null;
  previewUrl: string | null;
  icon: string;
}

export interface LogEntry {
  configId: string;
  name: string;
  line: string;
  timestamp: number;
}

interface RunnerState {
  services: RunnerService[];
  logs: LogEntry[];

  setServices: (services: RunnerService[]) => void;
  updateService: (id: string, partial: Partial<RunnerService>) => void;
  addLog: (entry: LogEntry) => void;
  setLogs: (entries: LogEntry[]) => void;
  clearLogs: () => void;
}

const MAX_LOGS = 1000;

export const useRunnerStore = create<RunnerState>((set) => ({
  services: [],
  logs: [],

  setServices: (services) => set({ services }),

  updateService: (id, partial) =>
    set((s) => ({
      services: s.services.map((svc) =>
        svc.id === id ? { ...svc, ...partial } : svc,
      ),
    })),

  addLog: (entry) =>
    set((s) => ({
      logs: [...s.logs.slice(-(MAX_LOGS - 1)), entry],
    })),

  setLogs: (entries) => set({ logs: entries.slice(-MAX_LOGS) }),

  clearLogs: () => set({ logs: [] }),
}));

/* ── Derived selectors ── */

export const selectServices = (s: RunnerState) => s.services;

export const selectIsAnyActive = (s: RunnerState) =>
  s.services.some(
    (svc) =>
      svc.status === RunnerStatus.Running ||
      svc.status === RunnerStatus.Starting,
  );

export const selectRunningCount = (s: RunnerState) =>
  s.services.filter(
    (svc) =>
      svc.status === RunnerStatus.Running ||
      svc.status === RunnerStatus.Starting,
  ).length;

/* ── Hook ── */

/**
 * Returns services filtered by status. Uses shallow comparison to avoid
 * infinite re-render loops from `.filter()` creating new array references.
 */
export function useServices(status?: RunnerStatus) {
  return useRunnerStore(
    useShallow((s) =>
      status ? s.services.filter((svc) => svc.status === status) : s.services,
    ),
  );
}

/* ── Helpers ── */

export function statusColor(status: RunnerStatus): string {
  if (status === RunnerStatus.Running) return "var(--studio-brand)";
  if (status === RunnerStatus.Starting) return "var(--studio-text-tertiary)";
  return "var(--studio-text-muted)";
}

export function isServiceActive(status: RunnerStatus): boolean {
  return status === RunnerStatus.Running || status === RunnerStatus.Starting;
}
