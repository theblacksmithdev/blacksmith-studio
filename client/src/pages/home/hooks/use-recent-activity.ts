import { useSessions } from '@/hooks/use-sessions'
import { useAgentConversations } from '@/hooks/use-agent-conversations'

export function useRecentActivity() {
  const { sessions } = useSessions({ limit: 3 })
  const { conversations: agentConvs } = useAgentConversations({ limit: 3 })

  return { sessions, agentConvs, hasRecent: sessions.length > 0 || agentConvs.length > 0 }
}
