import { useSessionsQuery } from '@/api/hooks/sessions'
import { useAgentConversationsQuery } from '@/api/hooks/agents'

export function useRecentActivity() {
  const { data: sessionsData } = useSessionsQuery({ limit: 3 })
  const { data: agentConvs = [] } = useAgentConversationsQuery()

  const sessions = sessionsData?.items ?? []
  const limitedConvs = agentConvs.slice(0, 3)

  return { sessions, agentConvs: limitedConvs, hasRecent: sessions.length > 0 || limitedConvs.length > 0 }
}
