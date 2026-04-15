import type { ChildProcess } from "node:child_process";

export type RunnerStatus = "stopped" | "starting" | "running";

export class RunnerProcess {
  readonly process: ChildProcess;
  readonly configId: string;
  readonly projectId: string;
  readonly name: string;
  readonly icon: string;
  private _port: number | null;
  private _status: RunnerStatus;
  private _previewUrlTemplate: string | null;

  constructor(opts: {
    process: ChildProcess;
    configId: string;
    projectId: string;
    name: string;
    port: number | null;
    status: RunnerStatus;
    previewUrlTemplate: string | null;
    icon: string;
  }) {
    this.process = opts.process;
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
}

export interface RunnerServiceStatus {
  id: string;
  name: string;
  status: RunnerStatus;
  port: number | null;
  previewUrl: string | null;
  icon: string;
}
