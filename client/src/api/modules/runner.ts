import { api as raw } from '../client'
import type { RunnerServiceStatus, RunnerConfigData, RunnerOutputEvent, NodeInstallation } from '../types'

export const runner = {
  // Status
  getStatus: () => raw.invoke<RunnerServiceStatus[]>('runner:getStatus'),

  // Start / Stop
  start: (configId?: string) => raw.invoke<void>('runner:start', { configId }),
  stop: (configId?: string) => raw.invoke<void>('runner:stop', { configId }),

  // Config CRUD
  getConfigs: () => raw.invoke<RunnerServiceStatus[]>('runner:getConfigs'),
  addConfig: (data: Partial<RunnerConfigData>) => raw.invoke<RunnerConfigData>('runner:addConfig', data),
  updateConfig: (id: string, updates: Partial<RunnerConfigData>) => raw.invoke<RunnerConfigData>('runner:updateConfig', { id, updates }),
  removeConfig: (id: string) => raw.invoke<void>('runner:removeConfig', { id }),

  // Detection
  detectRunners: () => raw.invoke<RunnerServiceStatus[]>('runner:detectRunners'),
  detectNode: () => raw.invoke<NodeInstallation[]>('runner:detectNode'),

  // Subscriptions
  onStatus: (cb: (data: RunnerServiceStatus[]) => void) => raw.subscribe('runner:onStatus', cb),
  onOutput: (cb: (data: RunnerOutputEvent) => void) => raw.subscribe('runner:onOutput', cb),
} as const
