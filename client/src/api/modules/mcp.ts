import { api as raw } from "../client";

export interface McpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

export interface McpServerEntry {
  name: string;
  transport: "stdio" | "http";
  config: McpServerConfig;
  enabled: boolean;
  status: "unknown" | "connected" | "error" | "disconnected";
  error?: string;
}

export const mcp = {
  list: (projectId: string) =>
    raw.invoke<McpServerEntry[]>("mcp:list", { projectId }),
  add: (projectId: string, data: { name: string; config: McpServerConfig }) =>
    raw.invoke<void>("mcp:add", { projectId, ...data }),
  update: (
    projectId: string,
    data: { name: string; config: McpServerConfig },
  ) => raw.invoke<void>("mcp:update", { projectId, ...data }),
  remove: (projectId: string, name: string) =>
    raw.invoke<void>("mcp:remove", { projectId, name }),
  toggle: (projectId: string, data: { name: string; enabled: boolean }) =>
    raw.invoke<void>("mcp:toggle", { projectId, ...data }),
  test: (projectId: string, name: string) =>
    raw.invoke<{ ok: boolean; error?: string }>("mcp:test", {
      projectId,
      name,
    }),
} as const;
