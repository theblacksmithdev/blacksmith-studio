import { api as raw } from '../client'
import type { RunnerServiceStatus, RunnerConfigData, RunnerOutputEvent, NodeInstallation } from '../types'

export const runner = {
  // Status
  getStatus: () => raw.invoke<RunnerServiceStatus[]>('runner:getStatus'),

  // Start / Stop
  start: (configId?: string) => raw.invoke<void>('runner:start', { configId }),
  stop: (configId?: string) => raw.invoke<void>('runner:stop', { configId }),

  // Config CRUD
  getConfigs: () => raw.invoke<RunnerConfigData[]>('runner:getConfigs'),
  addConfig: (data: Partial<RunnerConfigData>) => raw.invoke<RunnerConfigData>('runner:addConfig', data),
  updateConfig: (id: string, updates: Partial<RunnerConfigData>) => raw.invoke<RunnerConfigData>('runner:updateConfig', { id, updates }),
  removeConfig: (id: string) => raw.invoke<void>('runner:removeConfig', { id }),

  // Diagnosis

  // Setup
  setup: (configId: string) => raw.invoke<void>('runner:setup', { configId }),

  // Logs
  getLogs: (configId?: string) => raw.invoke<{ configId: string; name: string; line: string; timestamp: number }[]>('runner:getLogs', { configId }),

  // Detection
  detectRunners: () => raw.invoke<RunnerConfigData[]>('runner:detectRunners'),
  detectNode: () => raw.invoke<NodeInstallation[]>('runner:detectNode'),

  // Subscriptions
  onStatus: (cb: (data: RunnerServiceStatus[]) => void) => raw.subscribe('runner:onStatus', cb),
  onOutput: (cb: (data: RunnerOutputEvent) => void) => raw.subscribe('runner:onOutput', cb),
} as const
