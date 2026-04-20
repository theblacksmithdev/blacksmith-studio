import { spawn, type ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import type { OllamaBinaryResolver } from "./binary-resolver.js";

export type DaemonStatus = "stopped" | "starting" | "running" | "failed";

export interface DaemonStatusChange {
  status: DaemonStatus;
  /** Present only when `status === "failed"`. */
  error?: string;
  /** Last-line-or-so from stderr when failing — aids diagnosis. */
  lastLog?: string;
}

/**
 * Owns the `ollama serve` subprocess lifecycle.
 *
 * Responsibilities:
 *   - Start the daemon on demand (first AI request or UI "Start" click).
 *   - Wait for `/api/version` to respond before reporting "running".
 *   - Kill the daemon on app quit.
 *   - Surface status changes via events so the UI can show a chip.
 *
 * Non-responsibilities: downloading the binary (installer), locating
 * it (resolver), or talking to models (model-manager). This class is
 * a process-lifecycle component — nothing else.
 *
 * We do NOT auto-restart on crash today. A single crash should surface
 * a clear failure to the user rather than hide it behind a loop.
 */
export class OllamaDaemonManager extends EventEmitter {
  private proc: ChildProcess | null = null;
  private current: DaemonStatus = "stopped";
  private lastStderr: string[] = [];

  constructor(
    private readonly resolver: OllamaBinaryResolver,
    private readonly endpoint: () => string,
  ) {
    super();
  }

  get status(): DaemonStatus {
    return this.current;
  }

  /** Start the daemon if not already running; resolve once it's responsive. */
  async start(): Promise<void> {
    if (this.current === "running") return;
    if (this.current === "starting") {
      await this.waitFor("running", 15_000);
      return;
    }

    const binary = this.resolver.resolve();
    if (!binary) {
      throw new Error("Ollama is not installed.");
    }

    this.setStatus("starting");
    this.proc = spawn(binary.path, ["serve"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        // Default the host so we talk to the exact endpoint the UI knows.
        OLLAMA_HOST: hostFromEndpoint(this.endpoint()),
      },
    });
    this.lastStderr = [];

    this.proc.stderr?.on("data", (chunk: Buffer) => {
      const line = chunk.toString();
      this.lastStderr.push(line);
      if (this.lastStderr.length > 20) this.lastStderr.shift();
    });

    this.proc.on("error", (err) => {
      this.setStatus("failed", err.message);
      this.proc = null;
    });

    this.proc.on("exit", (code, signal) => {
      this.proc = null;
      if (this.current === "stopped") return;
      const reason = signal ? `signal ${signal}` : `exit ${code}`;
      this.setStatus("failed", `Ollama daemon exited (${reason})`, this.tailStderr());
    });

    try {
      await this.waitUntilReady();
      this.setStatus("running");
    } catch (err) {
      this.stopProcess();
      const message = err instanceof Error ? err.message : String(err);
      this.setStatus("failed", message, this.tailStderr());
      throw err;
    }
  }

  /** Stop the daemon if running. No-op if already stopped. */
  stop(): void {
    this.stopProcess();
    this.setStatus("stopped");
  }

  /**
   * Ensure the daemon is responsive. If a system-managed copy is
   * already running (e.g. Ollama.app), detect it and skip spawn.
   */
  async ensureRunning(): Promise<void> {
    if (await this.ping()) {
      if (this.current !== "running") this.setStatus("running");
      return;
    }
    await this.start();
  }

  /** Lightweight reachability probe. */
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint()}/api/version`, {
        signal: AbortSignal.timeout(1500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Called from the `before-quit` handler in main.ts. */
  shutdown(): void {
    this.stop();
  }

  private stopProcess(): void {
    if (this.proc && !this.proc.killed) this.proc.kill("SIGTERM");
    this.proc = null;
  }

  private setStatus(
    next: DaemonStatus,
    error?: string,
    lastLog?: string,
  ): void {
    this.current = next;
    const change: DaemonStatusChange = { status: next };
    if (error) change.error = error;
    if (lastLog) change.lastLog = lastLog;
    this.emit("status", change);
  }

  private tailStderr(): string {
    return this.lastStderr.join("").trim().split("\n").slice(-5).join("\n");
  }

  private async waitUntilReady(): Promise<void> {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      if (await this.ping()) return;
      await new Promise((r) => setTimeout(r, 250));
    }
    throw new Error("Ollama daemon did not become ready within 15s.");
  }

  private waitFor(target: DaemonStatus, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off("status", listener);
        reject(new Error(`Timed out waiting for Ollama to reach "${target}"`));
      }, timeoutMs);
      const listener = (change: DaemonStatusChange) => {
        if (change.status === target) {
          clearTimeout(timer);
          this.off("status", listener);
          resolve();
        } else if (change.status === "failed") {
          clearTimeout(timer);
          this.off("status", listener);
          reject(new Error(change.error ?? "Ollama failed to start"));
        }
      };
      this.on("status", listener);
    });
  }
}

/**
 * OLLAMA_HOST takes a `host:port` string (no scheme). Turn our full
 * endpoint URL into that shape so the daemon binds to the interface
 * the UI is configured to talk to.
 */
function hostFromEndpoint(endpoint: string): string {
  try {
    const u = new URL(endpoint);
    return u.port ? `${u.hostname}:${u.port}` : u.hostname;
  } catch {
    return "127.0.0.1:11434";
  }
}
