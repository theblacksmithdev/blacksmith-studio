import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys } from './use-project-keys'
import { useSessionStore } from '@/stores/session-store'
import { useProjectStore } from '@/stores/project-store'
import { useChatStore } from '@/stores/chat-store'
// Session type used implicitly via API return types

interface UseSessionsOptions {
  limit?: number
  offset?: number
}

export function useSessions(options?: UseSessionsOptions) {
  const { limit, offset } = options ?? {}
  const queryClient = useQueryClient()
  const keys = useProjectKeys()
  const { setActiveSession } = useSessionStore()
  const { loadMessages, clearMessages } = useChatStore()
  const activeProject = useProjectStore((s) => s.activeProject)

  const sessionsQuery = useQuery({
    queryKey: [...keys.sessions, { limit, offset }],
    queryFn: () => api.sessions.list({ limit, offset }),
    enabled: !!activeProject,
  })

  const createMutation = useMutation({
    mutationFn: (name?: string) => api.sessions.create({ name }),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: keys.sessions })
      setActiveSession(session.id)
      clearMessages()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.sessions.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.sessions })
    },
  })

  const loadSession = async (id: string) => {
    const session = await api.sessions.get({ id })
    setActiveSession(session.id)
    loadMessages(session.messages)
  }

  return {
    sessions: sessionsQuery.data?.items ?? [],
    total: sessionsQuery.data?.total ?? 0,
    isLoading: sessionsQuery.isLoading,
    fetchSessions: () => queryClient.invalidateQueries({ queryKey: keys.sessions }),
    createSession: async (name?: string) => {
      const session = await createMutation.mutateAsync(name)
      return session
    },
    loadSession,
    deleteSession: (id: string) => deleteMutation.mutate(id),
  }
}
