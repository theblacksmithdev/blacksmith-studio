import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Cancels the current project build.
 */
export function useAgentBuildCancel() {
  return useMutation({
    mutationFn: () => api.agents.buildCancel(),
  })
}
