import { api as raw } from '../client'
import type { RunnerTargetInput, RunnerStatusResult, RunnerOutputEvent, NodeInstallation } from '../types'

export const runner = {
  getStatus: () => raw.invoke<RunnerStatusResult>('runner:getStatus'),
  start: (input: RunnerTargetInput) => raw.invoke<void>('runner:start', input),
  stop: (input: RunnerTargetInput) => raw.invoke<void>('runner:stop', input),
  detectNode: () => raw.invoke<NodeInstallation[]>('runner:detectNode'),

  onStatus: (cb: (data: RunnerStatusResult) => void) => raw.subscribe('runner:onStatus', cb),
  onOutput: (cb: (data: RunnerOutputEvent) => void) => raw.subscribe('runner:onOutput', cb),
} as const
