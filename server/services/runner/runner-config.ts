import crypto from 'node:crypto'
import { eq, and, asc } from 'drizzle-orm'
import { getDatabase } from '../../db/index.js'
import { runnerConfigs } from '../../db/schema.js'

export interface RunnerConfig {
  id: string
  projectId: string
  name: string
  command: string
  setupCommand: string | null
  cwd: string
  port: number | null
  portArg: string | null
  env: Record<string, string>
  readyPattern: string | null
  previewUrl: string | null
  icon: string
  sortOrder: number
  autoDetected: boolean
  createdAt: string
}

export type RunnerConfigInput = Omit<RunnerConfig, 'id' | 'projectId' | 'createdAt'>

export class RunnerConfigService {
  private get db() { return getDatabase() }

  getConfigs(projectId: string): RunnerConfig[] {
    const rows = this.db.select().from(runnerConfigs)
      .where(eq(runnerConfigs.projectId, projectId))
      .orderBy(asc(runnerConfigs.sortOrder))
      .all()

    return rows.map(this.toConfig)
  }

  getConfig(id: string): RunnerConfig | null {
    const row = this.db.select().from(runnerConfigs)
      .where(eq(runnerConfigs.id, id))
      .get()
    return row ? this.toConfig(row) : null
  }

  addConfig(projectId: string, input: Partial<RunnerConfigInput> & { name: string; command: string }): RunnerConfig {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    this.db.insert(runnerConfigs).values({
      id,
      projectId,
      name: input.name,
      command: input.command,
      setupCommand: input.setupCommand ?? null,
      cwd: input.cwd ?? '.',
      port: input.port ?? null,
      portArg: input.portArg ?? null,
      env: JSON.stringify(input.env ?? {}),
      readyPattern: input.readyPattern ?? null,
      previewUrl: input.previewUrl ?? null,
      icon: input.icon ?? 'terminal',
      sortOrder: input.sortOrder ?? 0,
      autoDetected: input.autoDetected ?? false,
      createdAt: now,
    }).run()

    return this.getConfig(id)!
  }

  updateConfig(id: string, partial: Partial<RunnerConfigInput>): RunnerConfig | null {
    const updates: Record<string, any> = {}

    if (partial.name !== undefined) updates.name = partial.name
    if (partial.command !== undefined) updates.command = partial.command
    if (partial.setupCommand !== undefined) updates.setupCommand = partial.setupCommand
    if (partial.cwd !== undefined) updates.cwd = partial.cwd
    if (partial.port !== undefined) updates.port = partial.port
    if (partial.portArg !== undefined) updates.portArg = partial.portArg
    if (partial.env !== undefined) updates.env = JSON.stringify(partial.env)
    if (partial.readyPattern !== undefined) updates.readyPattern = partial.readyPattern
    if (partial.previewUrl !== undefined) updates.previewUrl = partial.previewUrl
    if (partial.icon !== undefined) updates.icon = partial.icon
    if (partial.sortOrder !== undefined) updates.sortOrder = partial.sortOrder
    if (partial.autoDetected !== undefined) updates.autoDetected = partial.autoDetected

    if (Object.keys(updates).length > 0) {
      this.db.update(runnerConfigs).set(updates).where(eq(runnerConfigs.id, id)).run()
    }

    return this.getConfig(id)
  }

  removeConfig(id: string): void {
    this.db.delete(runnerConfigs).where(eq(runnerConfigs.id, id)).run()
  }

  reorderConfigs(projectId: string, orderedIds: string[]): void {
    for (let i = 0; i < orderedIds.length; i++) {
      this.db.update(runnerConfigs)
        .set({ sortOrder: i })
        .where(and(eq(runnerConfigs.id, orderedIds[i]), eq(runnerConfigs.projectId, projectId)))
        .run()
    }
  }

  hasConfigs(projectId: string): boolean {
    const row = this.db.select({ id: runnerConfigs.id }).from(runnerConfigs)
      .where(eq(runnerConfigs.projectId, projectId))
      .limit(1)
      .get()
    return !!row
  }

  private toConfig(row: any): RunnerConfig {
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      command: row.command,
      setupCommand: row.setupCommand ?? null,
      cwd: row.cwd ?? '.',
      port: row.port ?? null,
      portArg: row.portArg ?? null,
      env: (() => { try { return JSON.parse(row.env || '{}') } catch { return {} } })(),
      readyPattern: row.readyPattern ?? null,
      previewUrl: row.previewUrl ?? null,
      icon: row.icon ?? 'terminal',
      sortOrder: row.sortOrder ?? 0,
      autoDetected: !!row.autoDetected,
      createdAt: row.createdAt,
    }
  }
}
