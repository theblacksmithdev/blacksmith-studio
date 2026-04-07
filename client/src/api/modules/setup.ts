import { api as raw } from '../client'

export interface SetupStatus {
  node: { installed: boolean; version?: string }
  claude: { installed: boolean; version?: string }
  auth: { authenticated: boolean }
}

export const setup = {
  check: () => raw.invoke<SetupStatus>('setup:check'),
  installClaude: () => raw.invoke<{ success: boolean; error?: string }>('setup:installClaude'),
} as const
