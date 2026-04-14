import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Installs the Claude CLI globally via npm.
 */
export function useInstallClaude() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: () => api.setup.installClaude(projectId),
  })
}
