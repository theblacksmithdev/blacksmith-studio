import { useState, useEffect } from 'react'
import { api } from '@/api'
import { useSessions } from '@/hooks/use-sessions'

export function useRecentActivity() {
  const { sessions } = useSessions({ limit: 3 })
  const [agentConvs, setAgentConvs] = useState<any[]>([])

  useEffect(() => {
    api.agents.listConversations()
      .then((convs) => setAgentConvs(convs.slice(0, 3)))
      .catch(() => {})
  }, [])

  return { sessions, agentConvs, hasRecent: sessions.length > 0 || agentConvs.length > 0 }
}
