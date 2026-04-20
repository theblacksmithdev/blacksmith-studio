import type { ChildProcess } from "node:child_process";
import { killByPort } from "./port-utils.js";

export type RunnerStatus = "stopped" | "starting" | "running";

interface RunnerProcessOpts {
  configId: string;
  projectId: string;
  name: string;
  port: number | null;
  status: RunnerStatus;
  previewUrlTemplate: string | null;
  icon: string;
}

export abstract class RunnerProcess {
  readonly configId: string;
  readonly projectId: string;
  readonly name: string;
  readonly icon: string;
  private _port: number | null;
  private _status: RunnerStatus;
  private _previewUrlTemplate: string | null;

  constructor(opts: RunnerProcessOpts) {
    this.configId = opts.configId;
    this.projectId = opts.projectId;
    this.name = opts.name;
    this.icon = opts.icon;
    this._port = opts.port;
    this._status = opts.status;
    this._previewUrlTemplate = opts.previewUrlTemplate;
  }

  get port(): number | null {
    return this._port;
  }
  set port(value: number | null) {
    this._port = value;
  }

  get status(): RunnerStatus {
    return this._status;
  }
  set status(value: RunnerStatus) {
    this._status = value;
  }

  /** Resolved preview URL — always uses the current port. */
  get previewUrl(): string | null {
    if (!this._previewUrlTemplate || !this._port) return null;
    return this._previewUrlTemplate.replace(/\{port\}/g, String(this._port));
  }

  /** Begin termination. Fire-and-forget; the manager handles state transitions. */
  abstract terminate(): void;

  /** True if this entry owns the given spawned child — used to ignore stale spawn callbacks. */
  abstract ownsSpawn(proc: ChildProcess): boolean;
}

const KILL_ESCALATION_MS = 5_000;

export class SpawnedRunnerProcess extends RunnerProcess {
  readonly process: ChildProcess;

  constructor(opts: RunnerProcessOpts & { process: ChildProcess }) {
    super(opts);
    this.process = opts.process;
  }

  terminate(): void {
    this.process.kill("SIGTERM");
    const timer = setTimeout(() => {
      try {
        this.process.kill("SIGKILL");
      } catch {
        // Process already exited
      }
    }, KILL_ESCALATION_MS);
    this.process.once("close", () => clearTimeout(timer));
  }

  ownsSpawn(proc: ChildProcess): boolean {
    return this.process === proc;
  }
}

/**
 * Represents a runner whose port was already held by an external process at start time.
 * We don't own the child, so stop falls back to killing by port.
 */
export class AdoptedRunnerProcess extends RunnerProcess {
  terminate(): void {
    const p = this.port;
    if (p != null) {
      void killByPort(p).catch(() => {
        // best-effort; if it fails the port stays busy and a later start will re-adopt
      });
    }
  }

  ownsSpawn(_proc: ChildProcess): boolean {
    return false;
  }
}

export interface RunnerServiceStatus {
  id: string;
  name: string;
  status: RunnerStatus;
  port: number | null;
  previewUrl: string | null;
  icon: string;
}
