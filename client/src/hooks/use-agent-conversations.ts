import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'

interface UseAgentConversationsOptions {
  limit?: number
}

export function useAgentConversations(options?: UseAgentConversationsOptions) {
  const { limit } = options ?? {}
  const queryClient = useQueryClient()
  const keys = useProjectKeys()

  const { data, isLoading } = useQuery({
    queryKey: keys.agentConversations,
    queryFn: () => api.agents.listConversations(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.agents.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.agentConversations })
    },
  })

  const conversations = data ?? []
  const limited = limit ? conversations.slice(0, limit) : conversations

  return {
    conversations: limited,
    allConversations: conversations,
    isLoading,
    deleteConversation: (id: string) => deleteMutation.mutate(id),
    isDeleting: deleteMutation.isPending,
  }
}
