import { useEffect, useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { ListTodo } from 'lucide-react'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useAgentStore } from '@/stores/agent-store'
import { Tooltip } from '@/components/shared/tooltip'
import { AgentCanvas } from '../canvas'
import { AgentChat } from '../chat'
import { AgentDetail } from '../detail'
import { TaskDrawer } from '../drawer'
import { useAgentEvents } from './use-agent-events'
import { useConversation } from './use-conversation'
import { Layout, ChatPanel, CanvasPanel, TasksBtn, Badge } from './styles'
import type { AgentRole } from '@/api/types'

interface AgentsPageProps {
  conversationId?: string
}

export function AgentsPage({ conversationId: propConvId }: AgentsPageProps) {
  const params = useParams()
  const conversationId = propConvId ?? params.conversationId
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents,
    queryFn: () => api.agents.list(),
  })

  const setAgents = useAgentStore((s) => s.setAgents)
  const removeInputRequest = useAgentStore((s) => s.removeInputRequest)
  const selectedAgent = useAgentStore((s) => s.selectedAgent)
  const selectAgent = useAgentStore((s) => s.selectAgent)
  const buildActive = useAgentStore((s) => s.buildActive)
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks)

  useEffect(() => {
    if (agents.length > 0) setAgents(agents)
  }, [agents, setAgents])

  useAgentEvents()
  const { currentConvId, handleSend } = useConversation(conversationId)

  const handleRespond = useCallback(async (requestId: string, value: string) => {
    removeInputRequest(requestId)
    await api.agents.respond(requestId, value)
  }, [removeInputRequest])

  const handleNodeClick = useCallback((role: AgentRole) => {
    selectAgent(selectedAgent === role ? null : role)
  }, [selectedAgent, selectAgent])

  const selectedAgentInfo = agents.find((a) => a.role === selectedAgent)
  const isProcessing = agents.some((a) => a.isRunning) || buildActive
  const hasTasks = dispatchTasks.length > 0
  const completedCount = dispatchTasks.filter((t) => t.status === 'done').length
  const hasRunning = dispatchTasks.some((t) => t.status === 'running')

  return (
    <Layout>
      <ChatPanel>
        <AgentChat onSend={handleSend} onRespond={handleRespond} isProcessing={isProcessing} />
      </ChatPanel>

      <CanvasPanel>
        <ReactFlowProvider>
          <AgentCanvas agents={agents} onNodeClick={handleNodeClick} conversationId={currentConvId} />
        </ReactFlowProvider>
        <Tooltip content="View task plan">
          <TasksBtn $active={hasRunning} $hasTasks={hasTasks} onClick={() => setDrawerOpen(true)}>
            <ListTodo size={14} />
            Tasks
            {hasTasks && <Badge>{completedCount}/{dispatchTasks.length}</Badge>}
          </TasksBtn>
        </Tooltip>
      </CanvasPanel>

      {selectedAgentInfo && (
        <AgentDetail agent={selectedAgentInfo} onClose={() => selectAgent(null)} />
      )}

      {drawerOpen && <TaskDrawer onClose={() => setDrawerOpen(false)} />}
    </Layout>
  )
}
