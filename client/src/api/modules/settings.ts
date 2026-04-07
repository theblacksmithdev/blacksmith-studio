import { api as raw } from '../client'
import type { SettingsMap } from '../types'

export const settings = {
  getAll: () => raw.invoke<SettingsMap>('settings:getAll'),
  update: (data: SettingsMap) => raw.invoke<SettingsMap>('settings:update', data),
} as const
