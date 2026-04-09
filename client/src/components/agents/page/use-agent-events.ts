import { useEffect } from 'react'
import { api } from '@/api'
import { useAgentStore } from '@/stores/agent-store'
import type { AgentRole } from '@/api/types'

export function useAgentEvents() {
  const handleAgentEvent = useAgentStore((s) => s.handleAgentEvent)
  const handleBuildEvent = useAgentStore((s) => s.handleBuildEvent)
  const addInputRequest = useAgentStore((s) => s.addInputRequest)
  const addChatMessage = useAgentStore((s) => s.addChatMessage)

  useEffect(() => {
    const unsubs = [
      api.agents.onEvent((event) => {
        handleAgentEvent(event)

        if (event.data.type === 'activity') {
          addChatMessage({ role: 'agent', agentRole: event.agentId as AgentRole, content: event.data.description })
        } else if (event.data.type === 'done') {
          addChatMessage({ role: 'system', content: `${event.agentId.replace(/-/g, ' ')} completed — $${event.data.costUsd?.toFixed(4) ?? '0'}` })
        } else if (event.data.type === 'error') {
          addChatMessage({ role: 'system', content: `${event.agentId.replace(/-/g, ' ')}: ${event.data.error}` })
        }
      }),
      api.agents.onBuildEvent((event) => {
        handleBuildEvent(event)
        addChatMessage({ role: 'system', content: event.data.message })
      }),
      api.agents.onInputRequest((request) => { addInputRequest(request) }),
    ]
    return () => unsubs.forEach((unsub) => unsub())
  }, [handleAgentEvent, handleBuildEvent, addInputRequest, addChatMessage])
}
