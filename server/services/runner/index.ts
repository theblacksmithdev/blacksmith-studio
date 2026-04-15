import { spawn } from "node:child_process";
import path from "node:path";
import {
  RunnerProcess,
  type RunnerServiceStatus,
  type RunnerStatus,
} from "./types.js";
import type { RunnerConfigService } from "./runner-config.js";
import { spawnRunner } from "./spawn-runner.js";
import { detectRunners } from "./detect-runners.js";
import { nodeEnv } from "../node-env.js";

export type { RunnerStatus, RunnerServiceStatus } from "./types.js";
export { RunnerConfigService } from "./runner-config.js";
export type { RunnerConfig } from "./runner-config.js";
export { detectRunners } from "./detect-runners.js";

type OutputListener = (
  configId: string,
  name: string,
  line: string,
  timestamp: number,
) => void;
type StatusListener = (services: RunnerServiceStatus[]) => void;

interface BufferedLog {
  configId: string;
  name: string;
  line: string;
  timestamp: number;
}

const MAX_BUFFERED_LOGS = 500;
const KILL_ESCALATION_MS = 5_000;

export class RunnerManager {
  private processes = new Map<string, RunnerProcess>();
  private outputListeners: OutputListener[] = [];
  private statusListeners: StatusListener[] = [];
  private configService: RunnerConfigService;
  private logBuffers = new Map<string, BufferedLog[]>();

  constructor(configService: RunnerConfigService) {
    this.configService = configService;
  }

  onOutput(cb: OutputListener) {
    this.outputListeners.push(cb);
  }
  onStatusChange(cb: StatusListener) {
    this.statusListeners.push(cb);
  }

  /** Returns buffered logs for a project, optionally filtered by configId. */
  getLogs(projectId: string, configId?: string): BufferedLog[] {
    const buf = this.logBuffers.get(projectId) ?? [];
    if (configId) return buf.filter((l) => l.configId === configId);
    return [...buf];
  }

  getStatus(projectId: string): RunnerServiceStatus[] {
    const configs = this.configService.getConfigs(projectId);
    return configs.map((c) => {
      const proc = this.processes.get(c.id);
      return {
        id: c.id,
        name: c.name,
        status: proc?.status ?? ("stopped" as RunnerStatus),
        port: proc?.port ?? null,
        previewUrl: proc?.previewUrl ?? null,
        icon: c.icon ?? "terminal",
      };
    });
  }

  async start(
    configId: string,
    projectRoot: string,
    nodePath?: string,
  ): Promise<void> {
    if (this.processes.has(configId)) return;

    const config = this.configService.getConfig(configId);
    if (!config) throw new Error(`Runner config not found.`);

    let currentProc: import("node:child_process").ChildProcess | null = null;

    const result = await spawnRunner(
      config,
      projectRoot,
      (id, line) => this.emitOutput(config.projectId, id, config.name, line),
      (id, status, port) => {
        const existing = this.processes.get(id);
        // Only update if the entry still belongs to this spawn (not a newer restart)
        if (existing && (!currentProc || existing.process === currentProc)) {
          existing.status = status;
          if (port != null) existing.port = port;
          if (status === "stopped") {
            this.processes.delete(id);
          }
        }
        this.emitStatus(config.projectId);
      },
      nodePath,
    );

    currentProc = result.process;

    this.processes.set(
      configId,
      new RunnerProcess({
        process: result.process,
        configId,
        projectId: config.projectId,
        name: config.name,
        port: result.port,
        status: "starting",
        previewUrlTemplate: config.previewUrl,
        icon: config.icon ?? "terminal",
      }),
    );
  }

  stop(configId: string): void {
    const proc = this.processes.get(configId);
    if (!proc) return;

    const projectId = proc.projectId;

    // Delete from map immediately so start() can re-add
    this.processes.delete(configId);
    proc.process.kill("SIGTERM");
    this.emitStatus(projectId);

    // Escalate to SIGKILL if process doesn't exit in time
    const killTimer = setTimeout(() => {
      try {
        proc.process.kill("SIGKILL");
      } catch {
        // Process already exited
      }
    }, KILL_ESCALATION_MS);

    proc.process.once("close", () => clearTimeout(killTimer));
  }

  async startAll(
    projectId: string,
    projectRoot: string,
    nodePath?: string,
  ): Promise<void> {
    const configs = this.configService.getConfigs(projectId);
    for (const config of configs) {
      if (!this.processes.has(config.id)) {
        await this.start(config.id, projectRoot, nodePath);
      }
    }
  }

  stopAll(projectId: string): void {
    const configs = this.configService.getConfigs(projectId);
    for (const config of configs) this.stop(config.id);
  }

  stopEverything(): void {
    for (const [id] of [...this.processes]) this.stop(id);
  }

  /**
   * Run the setup command for a service (e.g. npm install, pip install).
   * Streams output through the same log pipeline as the runner itself.
   * Resolves when the command exits. Rejects on non-zero exit code.
   */
  async setup(
    configId: string,
    projectRoot: string,
    nodePath?: string,
  ): Promise<void> {
    const config = this.configService.getConfig(configId);
    if (!config) throw new Error("Runner config not found.");
    if (!config.setupCommand)
      throw new Error("No setup command configured for this service.");

    const cwd = path.resolve(projectRoot, config.cwd ?? ".");
    const env = nodeEnv(nodePath, { ...config.env });

    this.emitOutput(
      config.projectId,
      configId,
      config.name,
      `[studio] Running setup: ${config.setupCommand}`,
    );

    return new Promise<void>((resolve, reject) => {
      const proc = spawn(config.setupCommand!, {
        cwd,
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
        env,
      } as any);

      let stdoutBuf = "";
      proc.stdout?.on("data", (chunk: Buffer) => {
        stdoutBuf += chunk.toString();
        const lines = stdoutBuf.split("\n");
        stdoutBuf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim())
            this.emitOutput(config.projectId, configId, config.name, line);
        }
      });

      let stderrBuf = "";
      proc.stderr?.on("data", (chunk: Buffer) => {
        stderrBuf += chunk.toString();
        const lines = stderrBuf.split("\n");
        stderrBuf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim())
            this.emitOutput(config.projectId, configId, config.name, line);
        }
      });

      proc.on("close", (code) => {
        if (stdoutBuf.trim())
          this.emitOutput(config.projectId, configId, config.name, stdoutBuf);
        if (stderrBuf.trim())
          this.emitOutput(config.projectId, configId, config.name, stderrBuf);

        if (code === 0) {
          this.emitOutput(
            config.projectId,
            configId,
            config.name,
            "[studio] Setup completed successfully.",
          );
          resolve();
        } else {
          this.emitOutput(
            config.projectId,
            configId,
            config.name,
            `[studio] Setup failed (exit code ${code}).`,
          );
          reject(new Error(`Setup failed with exit code ${code}`));
        }
      });

      proc.on("error", (err) => {
        this.emitOutput(
          config.projectId,
          configId,
          config.name,
          `[studio] Setup error: ${err.message}`,
        );
        reject(err);
      });
    });
  }

  detectAndSeed(projectId: string, projectRoot: string): void {
    if (this.configService.hasConfigs(projectId)) return;
    const detected = detectRunners(projectRoot);
    for (const runner of detected) {
      this.configService.addConfig(projectId, runner);
    }
  }

  private emitOutput(
    projectId: string,
    configId: string,
    name: string,
    line: string,
  ) {
    const ts = Date.now();
    const buf = this.logBuffers.get(projectId) ?? [];
    buf.push({ configId, name, line, timestamp: ts });
    if (buf.length > MAX_BUFFERED_LOGS) {
      this.logBuffers.set(projectId, buf.slice(-MAX_BUFFERED_LOGS));
    } else {
      this.logBuffers.set(projectId, buf);
    }
    for (const cb of this.outputListeners) cb(configId, name, line, ts);
  }

  private emitStatus(projectId: string) {
    const all = this.getStatus(projectId);
    for (const cb of this.statusListeners) cb(all);
  }
}
