/* ── Manager surface types ── */

export interface GraphifyMeta {
  builtAt: string;
  durationMs: number;
  version: string;
}

export interface GraphifyStatus {
  installed: boolean;
  exists: boolean;
  builtAt: string | null;
  stale: boolean;
  building: boolean;
  hasVisualization: boolean;
}

export interface GraphifyBuildResult {
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface GraphifyInstallCheck {
  installed: boolean;
  version?: string;
}

export interface GraphifySetupResult {
  success: boolean;
  error?: string;
}

export type ProgressCallback = (line: string) => void;

/* ── Graph schema (output of the graphify CLI) ── */

export interface GraphNode {
  id: string;
  label: string;
  file_type?: string;
  source_file?: string;
  community?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relation?: string;
  confidence?: string;
  source_file?: string;
}

export interface Graph {
  nodes: GraphNode[];
  links: GraphLink[];
}
