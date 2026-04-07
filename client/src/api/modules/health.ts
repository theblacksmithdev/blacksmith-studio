import { api as raw } from '../client'
import type { HealthStatus } from '../types'

export const health = {
  check: () => raw.invoke<HealthStatus>('health:check'),
} as const
