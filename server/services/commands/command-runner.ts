import { spawn, type ChildProcess } from "node:child_process";
import {
  CommandCancelledError,
  CommandTimeoutError,
} from "./errors.js";
import type {
  CommandOutputChunk,
  CommandResult,
  CommandStatus,
  CommandStatusChange,
  ResolvedInvocation,
} from "./types.js";

export type OutputListener = (chunk: CommandOutputChunk) => void;
export type StatusListener = (change: CommandStatusChange) => void;

export interface RunnerHandle {
  runId: string;
  promise: Promise<CommandResult>;
  cancel(): void;
}

export interface CommandRunnerOptions {
  /** Hard cap on the per-stream in-memory buffer, in bytes. */
  maxBufferedBytes?: number;
  /** Grace window between SIGTERM and SIGKILL when a run is cancelled/times out. */
  killGraceMs?: number;
}

export interface RunnerStartOptions {
  timeoutMs?: number;
  /** Optional stdin payload piped into the child before its stdin is closed. */
  stdin?: string;
}

const DEFAULT_MAX_BUFFERED_BYTES = 512 * 1024; // 512 KB per stream
const DEFAULT_KILL_GRACE_MS = 500;

/**
 * Tail-biased output buffer.
 *
 * Single Responsibility: cap the in-memory bytes we retain for a single
 * stream. Preserves the last N bytes — tails contain error context —
 * and records a truncation marker the first time an overflow happens.
 */
class BoundedOutputBuffer {
  private chunks: string[] = [];
  private bytes = 0;
  private truncated = false;

  constructor(private readonly maxBytes: number) {}

  append(chunk: string): void {
    const chunkBytes = Buffer.byteLength(chunk, "utf8");
    this.chunks.push(chunk);
    this.bytes += chunkBytes;
    while (this.bytes > this.maxBytes && this.chunks.length > 1) {
      const dropped = this.chunks.shift()!;
      this.bytes -= Buffer.byteLength(dropped, "utf8");
      this.truncated = true;
    }
    // Single chunk larger than the cap — slice it to the tail.
    if (this.chunks.length === 1 && this.bytes > this.maxBytes) {
      const only = this.chunks[0]!;
      const approxKeepChars = Math.max(1, Math.floor(this.maxBytes / 2));
      this.chunks[0] = only.slice(-approxKeepChars);
      this.bytes = Buffer.byteLength(this.chunks[0]!, "utf8");
      this.truncated = true;
    }
  }

  toString(): string {
    const body = this.chunks.join("");
    if (!this.truncated) return body;
    return `…[truncated earlier output]\n${body}`;
  }
}

/**
 * Single point that actually spawns a subprocess.
 *
 * Single Responsibility: spawn + pipe + timeout + cancel + streaming.
 * Knows nothing about toolchains, presets, or persistence. Every
 * subsystem that wants to run a process MUST go through this class,
 * which is how we get uniform env + audit + signal handling.
 *
 * The runner is stateful only in the narrow sense of tracking active
 * processes so `cancel(runId)` works. All other outputs are observed
 * via the two listener lists.
 */
export class CommandRunner {
  private readonly active = new Map<string, ChildProcess>();
  private outputListeners: OutputListener[] = [];
  private statusListeners: StatusListener[] = [];
  private readonly maxBufferedBytes: number;
  private readonly killGraceMs: number;

  constructor(opts: CommandRunnerOptions = {}) {
    this.maxBufferedBytes = opts.maxBufferedBytes ?? DEFAULT_MAX_BUFFERED_BYTES;
    this.killGraceMs = opts.killGraceMs ?? DEFAULT_KILL_GRACE_MS;
  }

  onChunk(listener: OutputListener): () => void {
    this.outputListeners.push(listener);
    return () => {
      this.outputListeners = this.outputListeners.filter((l) => l !== listener);
    };
  }

  onStatus(listener: StatusListener): () => void {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  /** Start a process; returns a handle with runId + completion promise. */
  start(
    runId: string,
    invocation: ResolvedInvocation,
    opts: RunnerStartOptions = {},
  ): RunnerHandle {
    const timeoutMs = opts.timeoutMs;
    const stdinProvided = typeof opts.stdin === "string";
    const child = spawn(invocation.command, invocation.args, {
      cwd: invocation.cwd,
      env: invocation.env,
      stdio: [stdinProvided ? "pipe" : "ignore", "pipe", "pipe"],
    });
    if (stdinProvided && child.stdin) {
      child.stdin.end(opts.stdin ?? "");
    }
    this.active.set(runId, child);

    const stdoutBuf = new BoundedOutputBuffer(this.maxBufferedBytes);
    const stderrBuf = new BoundedOutputBuffer(this.maxBufferedBytes);
    let settled = false;
    const startedAt = Date.now();

    const emitStatus = (
      status: CommandStatus,
      exitCode: number | null,
    ): void => {
      const durationMs = Date.now() - startedAt;
      for (const l of this.statusListeners) {
        try {
          l({ runId, status, exitCode, durationMs });
        } catch (err) {
          console.error("[command-runner] status listener error:", err);
        }
      }
    };

    const emitChunk = (stream: "stdout" | "stderr", chunk: string): void => {
      for (const l of this.outputListeners) {
        try {
          l({ runId, stream, chunk });
        } catch (err) {
          console.error("[command-runner] output listener error:", err);
        }
      }
    };

    emitStatus("running", null);

    child.stdout?.setEncoding("utf8").on("data", (d: string) => {
      stdoutBuf.append(d);
      emitChunk("stdout", d);
    });
    child.stderr?.setEncoding("utf8").on("data", (d: string) => {
      stderrBuf.append(d);
      emitChunk("stderr", d);
    });

    let timer: NodeJS.Timeout | null = null;
    let timedOut = false;
    let cancelled = false;

    if (timeoutMs && timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        try {
          child.kill("SIGTERM");
          // Escalate to SIGKILL after a grace window.
          setTimeout(() => {
            if (!settled) {
              try {
                child.kill("SIGKILL");
              } catch {
                /* already dead */
              }
            }
          }, this.killGraceMs);
        } catch {
          /* already dead */
        }
      }, timeoutMs);
    }

    const promise = new Promise<CommandResult>((resolve, reject) => {
      const finalize = (
        status: CommandStatus,
        exitCode: number | null,
      ): void => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        this.active.delete(runId);
        const finishedAt = Date.now();
        emitStatus(status, exitCode);
        if (status === "timeout") {
          reject(new CommandTimeoutError(timeoutMs ?? 0));
          return;
        }
        if (status === "cancelled") {
          reject(new CommandCancelledError());
          return;
        }
        resolve({
          runId,
          status,
          exitCode,
          stdout: stdoutBuf.toString(),
          stderr: stderrBuf.toString(),
          startedAt: new Date(startedAt).toISOString(),
          finishedAt: new Date(finishedAt).toISOString(),
          durationMs: finishedAt - startedAt,
          toolchainId: invocation.toolchainId,
          resolvedEnvDisplay: invocation.resolvedEnvDisplay,
        });
      };

      child.on("error", (err) => {
        stderrBuf.append(`\n[spawn error] ${err.message}`);
        finalize("error", null);
      });
      child.on("close", (code, signal) => {
        if (timedOut) return finalize("timeout", code);
        if (cancelled) return finalize("cancelled", code);
        if (code === 0) return finalize("done", 0);
        if (signal) stderrBuf.append(`\n[terminated by ${signal}]`);
        finalize("error", code);
      });
    });

    return {
      runId,
      promise,
      cancel: () => {
        if (settled) return;
        cancelled = true;
        try {
          child.kill("SIGTERM");
        } catch {
          /* already dead */
        }
      },
    };
  }

  cancel(runId: string): boolean {
    const child = this.active.get(runId);
    if (!child) return false;
    try {
      child.kill("SIGTERM");
    } catch {
      /* already dead */
    }
    return true;
  }

  isActive(runId: string): boolean {
    return this.active.has(runId);
  }
}
