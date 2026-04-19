import { api as raw } from "../client";
import type {
  CommandErrorShape,
  CommandOutputChunk,
  CommandResult,
  CommandRunRecord,
  CommandScope,
  CommandSpec,
  CommandStatusChange,
  InstalledVersion,
  ToolchainEnv,
  ToolchainInfo,
} from "../types";

export type CommandRunResponse = CommandResult | CommandErrorShape;
export type CommandStreamStartResponse =
  | { runId: string }
  | CommandErrorShape;

export const commands = {
  run: (spec: CommandSpec) =>
    raw.invoke<CommandRunResponse>("commands:run", spec),

  streamStart: (spec: CommandSpec) =>
    raw.invoke<CommandStreamStartResponse>("commands:streamStart", spec),

  cancel: (runId: string) =>
    raw.invoke<{ ok: boolean }>("commands:cancel", { runId }),

  checkAvailable: (input: {
    projectId?: string;
    toolchainId: string;
    scope: CommandScope;
  }) =>
    raw.invoke<{ ok: boolean; version?: string; error?: string }>(
      "commands:checkAvailable",
      input,
    ),

  resolveEnv: (input: {
    projectId?: string;
    toolchainId: string;
    scope: CommandScope;
  }) => raw.invoke<ToolchainEnv | null>("commands:resolveEnv", input),

  listToolchains: () =>
    raw.invoke<ToolchainInfo[]>("commands:listToolchains"),

  listInstalledVersions: (toolchainId: string) =>
    raw.invoke<InstalledVersion[]>("commands:listInstalledVersions", {
      toolchainId,
    }),

  createEnv: (input: {
    projectId?: string;
    toolchainId: string;
    scope: CommandScope;
    options?: Record<string, unknown>;
  }) =>
    raw.invoke<ToolchainEnv | CommandErrorShape>("commands:createEnv", input),

  deleteEnv: (input: {
    projectId?: string;
    toolchainId: string;
    scope: CommandScope;
  }) =>
    raw.invoke<{ ok: true } | CommandErrorShape>("commands:deleteEnv", input),

  listRuns: (input: {
    projectId: string;
    conversationId?: string;
    limit?: number;
  }) => raw.invoke<CommandRunRecord[]>("commands:listRuns", input),

  getRun: (runId: string) =>
    raw.invoke<CommandRunRecord | null>("commands:getRun", { runId }),

  onOutput: (cb: (chunk: CommandOutputChunk) => void) =>
    raw.subscribe("commands:onOutput", cb),

  onStatus: (cb: (status: CommandStatusChange) => void) =>
    raw.subscribe("commands:onStatus", cb),
} as const;
