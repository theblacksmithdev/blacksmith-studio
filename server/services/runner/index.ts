import type { RunnerProcess, RunnerServiceStatus, RunnerStatus } from './types.js'
import type { RunnerConfigService, RunnerConfig } from './runner-config.js'
import { spawnRunner } from './spawn-runner.js'
import { detectRunners } from './detect-runners.js'

export type { RunnerStatus, RunnerServiceStatus } from './types.js'
export { RunnerConfigService } from './runner-config.js'
export type { RunnerConfig } from './runner-config.js'
export { detectRunners } from './detect-runners.js'

type OutputListener = (configId: string, line: string) => void
type StatusListener = (services: RunnerServiceStatus[]) => void

export class RunnerManager {
  private processes = new Map<string, RunnerProcess>()
  private outputListeners: OutputListener[] = []
  private statusListeners: StatusListener[] = []
  private configService: RunnerConfigService

  constructor(configService: RunnerConfigService) {
    this.configService = configService
  }

  onOutput(cb: OutputListener) { this.outputListeners.push(cb) }
  onStatusChange(cb: StatusListener) { this.statusListeners.push(cb) }

  getStatus(projectId: string): RunnerServiceStatus[] {
    const configs = this.configService.getConfigs(projectId)
    return configs.map((c) => {
      const proc = this.processes.get(c.id)
      return {
        id: c.id,
        name: c.name,
        status: proc?.status ?? ('stopped' as RunnerStatus),
        port: proc?.port ?? null,
        previewUrl: proc?.previewUrl ?? null,
        icon: c.icon ?? 'terminal',
      }
    })
  }

  async start(configId: string, projectRoot: string, nodePath?: string): Promise<void> {
    if (this.processes.has(configId)) return

    const config = this.configService.getConfig(configId)
    if (!config) throw new Error(`Runner config not found.`)

    const result = await spawnRunner(
      config,
      projectRoot,
      (id, line) => this.emitOutput(id, line),
      (id, status, port) => {
        const existing = this.processes.get(id)
        if (existing) {
          existing.status = status
          if (port != null) existing.port = port
        }
        if (status === 'stopped') this.processes.delete(id)
        this.emitStatus()
      },
      nodePath,
    )

    this.processes.set(configId, {
      process: result.process,
      configId,
      name: config.name,
      port: result.port,
      status: 'starting',
      previewUrl: result.resolvedPreviewUrl,
      icon: config.icon ?? 'terminal',
    })
  }

  stop(configId: string): void {
    const proc = this.processes.get(configId)
    if (!proc) return
    proc.process.kill('SIGTERM')
    this.processes.delete(configId)
    this.emitStatus()
  }

  async startAll(projectId: string, projectRoot: string, nodePath?: string): Promise<void> {
    const configs = this.configService.getConfigs(projectId)
    for (const config of configs) {
      if (!this.processes.has(config.id)) {
        await this.start(config.id, projectRoot, nodePath)
      }
    }
  }

  stopAll(projectId: string): void {
    const configs = this.configService.getConfigs(projectId)
    for (const config of configs) this.stop(config.id)
  }

  stopEverything(): void {
    for (const [id] of this.processes) this.stop(id)
  }

  detectAndSeed(projectId: string, projectRoot: string): void {
    if (this.configService.hasConfigs(projectId)) return
    const detected = detectRunners(projectRoot)
    for (const runner of detected) {
      this.configService.addConfig(projectId, runner)
    }
  }

  private emitOutput(configId: string, line: string) {
    for (const cb of this.outputListeners) cb(configId, line)
  }

  private emitStatus() {
    const all: RunnerServiceStatus[] = []
    for (const proc of this.processes.values()) {
      all.push({
        id: proc.configId,
        name: proc.name,
        status: proc.status,
        port: proc.port,
        previewUrl: proc.previewUrl,
        icon: proc.icon,
      })
    }
    for (const cb of this.statusListeners) cb(all)
  }
}
