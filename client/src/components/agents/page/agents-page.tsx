import { useEffect, useCallback, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { ListTodo, MessageSquare, X } from 'lucide-react'
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
import {
  Layout, CanvasPanel, ButtonGroup, TasksBtn, ChatBtn, Badge, UnreadDot,
  ChatOverlay,
} from './styles'
import type { AgentRole } from '@/api/types'

interface AgentsPageProps {
  conversationId?: string
}

export function AgentsPage({ conversationId: propConvId }: AgentsPageProps) {
  const params = useParams()
  const conversationId = propConvId ?? params.conversationId
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatClosing, setChatClosing] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const chatOpenRef = useRef(chatOpen)
  chatOpenRef.current = chatOpen

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
  const chatMessages = useAgentStore((s) => s.chatMessages)

  useEffect(() => {
    if (agents.length > 0) setAgents(agents)
  }, [agents, setAgents])

  useAgentEvents()
  const { currentConvId, handleSend } = useConversation(conversationId)

  // Track unread messages when chat is closed
  const prevCountRef = useRef(chatMessages.length)
  useEffect(() => {
    if (chatMessages.length > prevCountRef.current && !chatOpenRef.current) {
      setHasUnread(true)
    }
    prevCountRef.current = chatMessages.length
  }, [chatMessages.length])

  const openChat = useCallback(() => {
    setChatOpen(true)
    setChatClosing(false)
    setHasUnread(false)
  }, [])

  const closeChat = useCallback(() => {
    setChatClosing(true)
    setTimeout(() => {
      setChatOpen(false)
      setChatClosing(false)
    }, 200)
  }, [])

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
      <CanvasPanel>
        <ReactFlowProvider>
          <AgentCanvas agents={agents} onNodeClick={handleNodeClick} conversationId={currentConvId} />
        </ReactFlowProvider>

        {/* Floating buttons */}
        <ButtonGroup $shift={chatOpen && !chatClosing}>
          <Tooltip content={chatOpen ? 'Close chat' : 'Open chat'}>
            <ChatBtn $active={chatOpen} onClick={chatOpen ? closeChat : openChat}>
              {chatOpen ? <X size={14} /> : <MessageSquare size={14} />}
              Chat
              {hasUnread && !chatOpen && <UnreadDot />}
            </ChatBtn>
          </Tooltip>

          <Tooltip content="View task plan">
            <TasksBtn $active={hasRunning} $hasTasks={hasTasks} onClick={() => setDrawerOpen(true)}>
              <ListTodo size={14} />
              Tasks
              {hasTasks && <Badge>{completedCount}/{dispatchTasks.length}</Badge>}
            </TasksBtn>
          </Tooltip>
        </ButtonGroup>

        {/* Sliding chat panel within the canvas */}
        {chatOpen && (
          <ChatOverlay $closing={chatClosing}>
            <AgentChat onSend={handleSend} onRespond={handleRespond} isProcessing={isProcessing} onClose={closeChat} />
          </ChatOverlay>
        )}
        {/* Agent detail panel within the canvas */}
        {selectedAgentInfo && (
          <AgentDetail agent={selectedAgentInfo} onClose={() => selectAgent(null)} />
        )}
      </CanvasPanel>

      {drawerOpen && <TaskDrawer onClose={() => setDrawerOpen(false)} />}
    </Layout>
  )
}
