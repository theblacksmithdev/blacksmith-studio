import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Installs the Claude CLI globally via npm.
 */
export function useInstallClaude() {
  return useMutation({
    mutationFn: () => api.setup.installClaude(),
  })
}
