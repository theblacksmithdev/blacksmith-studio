import { api as raw } from '../client'
import type { SettingsMap } from '../types'

export const settings = {
  getAll: () => raw.invoke<SettingsMap>('settings:getAll'),
  update: (data: SettingsMap) => raw.invoke<SettingsMap>('settings:update', data),

  // Global settings (no active project required)
  getAllGlobal: () => raw.invoke<Record<string, any>>('settings:getAllGlobal'),
  updateGlobal: (data: Record<string, any>) => raw.invoke<Record<string, any>>('settings:updateGlobal', data),
} as const
