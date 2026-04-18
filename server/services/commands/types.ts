/**
 * Core types that flow across the CommandService layer.
 *
 * `CommandSpec` is what callers hand in. `ResolvedInvocation` is the
 * concrete shape the runner needs. `CommandResult` is what callers get
 * back. Every cross-module contract in the commands subsystem travels
 * through one of these shapes.
 */

export type CommandScope = "studio" | "project";

export type CommandStatus =
  | "running"
  | "done"
  | "error"
  | "cancelled"
  | "timeout";

export type PresetName = string;

export interface CommandSpec {
  scope: CommandScope;
  projectId: string;
  preset?: PresetName;
  command?: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  /** Optional audit metadata — surfaces in the command_executed event. */
  description?: string;
  conversationId?: string;
  taskId?: string;
  agentRole?: string;
}

export interface ResolvedInvocation {
  toolchainId: string;
  preset: PresetName | null;
  command: string; // absolute path or resolved binary
  args: string[];
  cwd: string;
  env: Record<string, string>;
  resolvedEnvDisplay: string | null;
  scope: CommandScope;
}

export interface CommandResult {
  runId: string;
  status: CommandStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  toolchainId: string;
  resolvedEnvDisplay: string | null;
}

export interface CommandOutputChunk {
  runId: string;
  stream: "stdout" | "stderr";
  chunk: string;
}

export interface CommandStatusChange {
  runId: string;
  status: CommandStatus;
  exitCode: number | null;
  durationMs: number | null;
}
