import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Clears all chat messages for the active project.
 */
export function useAgentClearChat() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: () => api.agents.clearChat(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentConversations })
    },
  })
}
