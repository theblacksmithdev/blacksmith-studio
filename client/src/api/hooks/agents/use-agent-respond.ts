import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Responds to a human input request during a build.
 */
export function useAgentRespond() {
  return useMutation({
    mutationFn: ({ requestId, value }: { requestId: string; value: string }) =>
      api.agents.respond(requestId, value),
  })
}
