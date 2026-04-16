import { api as raw } from "../client";

export interface GraphifyInstallStatus {
  installed: boolean;
  version?: string;
}

export interface GraphifyStatus {
  installed: boolean;
  exists: boolean;
  builtAt: string | null;
  stale: boolean;
  building: boolean;
}

export interface GraphifyBuildResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface GraphifySetupResult {
  success: boolean;
  error?: string;
}

export const graphify = {
  check: () => raw.invoke<GraphifyInstallStatus>("graphify:check"),
  setup: (projectId?: string) =>
    raw.invoke<GraphifySetupResult>("graphify:setup", projectId ? { projectId } : undefined),
  status: (projectId: string) =>
    raw.invoke<GraphifyStatus>("graphify:status", { projectId }),
  build: (projectId: string) =>
    raw.invoke<GraphifyBuildResult>("graphify:build", { projectId }),
  query: (projectId: string, question: string) =>
    raw.invoke<string>("graphify:query", { projectId, question }),
  clean: (projectId: string) =>
    raw.invoke<void>("graphify:clean", { projectId }),
  openVisualization: (projectId: string) =>
    raw.invoke<void>("graphify:openVisualization", { projectId }),
  onBuildProgress: (cb: (data: { line: string }) => void) =>
    raw.subscribe("graphify:onBuildProgress", cb),
} as const;
