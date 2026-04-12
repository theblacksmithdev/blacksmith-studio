import type { ChildProcess } from 'node:child_process'

export type RunnerStatus = 'stopped' | 'starting' | 'running'

export interface RunnerProcess {
  process: ChildProcess
  configId: string
  name: string
  port: number | null
  status: RunnerStatus
  previewUrl: string | null
  icon: string
}

export interface RunnerServiceStatus {
  id: string
  name: string
  status: RunnerStatus
  port: number | null
  previewUrl: string | null
  icon: string
}
