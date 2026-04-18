import crypto from "node:crypto";
import type { CommandEventEmitter } from "./command-event-emitter.js";
import type { CommandPolicy } from "./command-policy.js";
import type { CommandResolver } from "./command-resolver.js";
import type { CommandRunner, RunnerHandle } from "./command-runner.js";
import { TooManyConcurrentCommandsError } from "./errors.js";
import type { CommandRunRepository } from "./repositories/command-run-repository.js";
import type { ToolchainRegistry } from "./toolchains/registry.js";
import { isEnvCreatingToolchain } from "./toolchains/types.js";
import type { Toolchain, ToolchainEnv } from "./toolchains/types.js";
import type {
  CommandResult,
  CommandSpec,
  CommandStatus,
  CommandStatusChange,
} from "./types.js";

/** Caps on persisted output sizes. Over this, we truncate with a footer. */
const STDOUT_LIMIT_BYTES = 64 * 1024;
const STDERR_LIMIT_BYTES = 64 * 1024;
const DEFAULT_CONCURRENCY_LIMIT = 8;

export interface CommandServiceOptions {
  /** Max simultaneous running commands per project. Default: 8. */
  concurrencyLimitPerProject?: number;
}

export interface ToolchainInfo {
  id: string;
  displayName: string;
  presetOwnership: readonly string[];
  binaries: readonly string[];
  /** True when the toolchain implements `EnvCreatingToolchain` — the
   *  UI renders a "Set up environment" affordance for these. */
  supportsProjectEnvCreation: boolean;
}

/**
 * Facade over the command subsystem.
 *
 * Single Responsibility: composition + delegation. Persists the audit
 * row, asks the resolver for an invocation, hands it to the runner,
 * attaches the event emitter to the completion. Holds zero business
 * logic of its own.
 *
 * Dependency Inversion: every collaborator is a constructor-injected
 * interface/class; no module-level singletons.
 */
export class CommandService {
  private readonly activePerProject = new Map<string, number>();
  private readonly concurrencyLimit: number;

  constructor(
    private readonly registry: ToolchainRegistry,
    private readonly resolver: CommandResolver,
    private readonly runner: CommandRunner,
    private readonly runs: CommandRunRepository,
    private readonly emitter: CommandEventEmitter,
    private readonly policy: CommandPolicy | null = null,
    opts: CommandServiceOptions = {},
  ) {
    this.concurrencyLimit =
      opts.concurrencyLimitPerProject ?? DEFAULT_CONCURRENCY_LIMIT;
  }

  /** Blocking: run to completion, return the full result. */
  async run(spec: CommandSpec): Promise<CommandResult> {
    const handle = this.start(spec);
    return handle.promise;
  }

  /** Non-blocking: returns the handle so callers can stream output. */
  stream(spec: CommandSpec): RunnerHandle {
    return this.start(spec);
  }

  cancel(runId: string): boolean {
    return this.runner.cancel(runId);
  }

  checkAvailable(opts: {
    projectId: string;
    toolchainId: string;
    scope: "studio" | "project";
  }): Promise<{ ok: boolean; version?: string; error?: string }> {
    const toolchain = this.registry.getById(opts.toolchainId);
    const env = this.resolveEnv({ ...opts }) ?? null;
    if (!env) return Promise.resolve({ ok: false, error: "No environment" });
    return toolchain.checkAvailable(env);
  }

  resolveEnv(opts: {
    projectId: string;
    toolchainId: string;
    scope: "studio" | "project";
  }): ToolchainEnv | null {
    const toolchain = this.registry.getById(opts.toolchainId);
    if (opts.scope === "studio") {
      return toolchain.detectStudioEnv({
        studioRoot: this.studioRoot(),
      });
    }
    const projectRoot = this.resolver["projects"].getPath(opts.projectId);
    return toolchain.detectProjectEnv({
      projectId: opts.projectId,
      projectRoot,
    });
  }

  listToolchains(): ToolchainInfo[] {
    return this.registry.all().map((tc: Toolchain) => ({
      id: tc.id,
      displayName: tc.displayName,
      presetOwnership: tc.presetOwnership,
      binaries: tc.binaries,
      supportsProjectEnvCreation: isEnvCreatingToolchain(tc),
    }));
  }

  /**
   * Bootstrap a project-scoped environment for a toolchain that
   * implements `EnvCreatingToolchain` (currently: Python → `.venv`).
   * Throws when the toolchain doesn't support creation so callers can
   * hide the affordance or render a clear error.
   */
  async createProjectEnv(opts: {
    projectId: string;
    toolchainId: string;
    options?: Record<string, unknown>;
  }): Promise<ToolchainEnv> {
    const toolchain = this.registry.getById(opts.toolchainId);
    if (!isEnvCreatingToolchain(toolchain)) {
      throw new Error(
        `Toolchain "${toolchain.id}" does not support environment creation.`,
      );
    }
    const projectRoot = this.resolver["projects"].getPath(opts.projectId);
    return toolchain.createProjectEnv(
      { projectId: opts.projectId, projectRoot },
      opts.options ?? {},
    );
  }

  listRuns(
    projectId: string,
    conversationId?: string,
    limit?: number,
  ): ReturnType<CommandRunRepository["listForProject"]> {
    return this.runs.listForProject(projectId, limit, conversationId);
  }

  getRun(runId: string): ReturnType<CommandRunRepository["findById"]> {
    return this.runs.findById(runId);
  }

  /** Expose runner event subscriptions to IPC without leaking the runner. */
  onChunk(listener: Parameters<CommandRunner["onChunk"]>[0]): () => void {
    return this.runner.onChunk(listener);
  }

  onStatus(listener: Parameters<CommandRunner["onStatus"]>[0]): () => void {
    return this.runner.onStatus(listener);
  }

  // ── internals ──

  private start(spec: CommandSpec): RunnerHandle {
    const invocation = this.resolver.resolve(spec);
    if (this.policy) {
      this.policy.check(spec, invocation);
    }
    const currentActive = this.activePerProject.get(spec.projectId) ?? 0;
    if (currentActive >= this.concurrencyLimit) {
      throw new TooManyConcurrentCommandsError(
        spec.projectId,
        this.concurrencyLimit,
      );
    }
    this.activePerProject.set(spec.projectId, currentActive + 1);

    const runId = crypto.randomUUID();
    const startedAt = new Date().toISOString();

    this.runs.insert({
      id: runId,
      projectId: spec.projectId,
      conversationId: spec.conversationId ?? null,
      taskId: spec.taskId ?? null,
      agentRole: spec.agentRole ?? null,
      toolchainId: invocation.toolchainId,
      preset: invocation.preset,
      scope: invocation.scope,
      command: invocation.command,
      args: JSON.stringify(invocation.args),
      cwd: invocation.cwd,
      resolvedEnvDisplay: invocation.resolvedEnvDisplay,
      startedAt,
      status: "running",
    });

    const handle = this.runner.start(runId, invocation, {
      timeoutMs: spec.timeoutMs,
      stdin: spec.stdin,
    });
    const wrapped = this.finalize(spec, invocation, handle);
    return { ...handle, promise: wrapped };
  }

  private finalize(
    spec: CommandSpec,
    invocation: ReturnType<CommandResolver["resolve"]>,
    handle: RunnerHandle,
  ): Promise<CommandResult> {
    return handle.promise
      .then((result) => {
        this.releaseSlot(spec.projectId);
        this.persistCompletion(result);
        this.emitter.emitCompleted(spec, invocation, result);
        return result;
      })
      .catch((err) => {
        this.releaseSlot(spec.projectId);
        // Typed errors from the runner (timeout / cancelled) — persist
        // with the matching status so the audit row stays honest.
        const status: CommandStatus = err?.code === "COMMAND_TIMEOUT"
          ? "timeout"
          : err?.code === "COMMAND_CANCELLED"
            ? "cancelled"
            : "error";
        const finishedAt = new Date().toISOString();
        this.runs.update(handle.runId, {
          status,
          finishedAt,
          exitCode: null,
          stdout: null,
          stderr: err?.message ?? String(err),
        });
        // Also emit a compact event so the Timeline doesn't lose the run.
        this.emitter.emitCompleted(spec, invocation, {
          runId: handle.runId,
          status,
          exitCode: null,
          stdout: "",
          stderr: err?.message ?? String(err),
          startedAt: "",
          finishedAt,
          durationMs: 0,
          toolchainId: invocation.toolchainId,
          resolvedEnvDisplay: invocation.resolvedEnvDisplay,
        });
        throw err;
      });
  }

  private releaseSlot(projectId: string): void {
    const current = this.activePerProject.get(projectId) ?? 0;
    if (current <= 1) this.activePerProject.delete(projectId);
    else this.activePerProject.set(projectId, current - 1);
  }

  private persistCompletion(result: CommandResult): void {
    this.runs.update(result.runId, {
      status: result.status,
      exitCode: result.exitCode,
      stdout: truncate(result.stdout, STDOUT_LIMIT_BYTES),
      stderr: truncate(result.stderr, STDERR_LIMIT_BYTES),
      finishedAt: result.finishedAt,
      durationMs: result.durationMs,
    });
  }

  private studioRoot(): string {
    // Resolver stores its own studio root; re-deriving here keeps
    // this method independent. Same default path.
    return this.resolver["studioRoot"] as string;
  }
}

function truncate(s: string, limitBytes: number): string {
  const bytes = Buffer.byteLength(s, "utf-8");
  if (bytes <= limitBytes) return s;
  // Keep UTF-8 safety by slicing characters, not bytes.
  const approxChars = Math.floor(limitBytes / 2);
  return (
    s.slice(0, approxChars) +
    `\n…[truncated, original ${bytes} bytes]`
  );
}

// Keep CommandStatusChange referenced for future re-exports (IPC).
export type { CommandStatusChange };
