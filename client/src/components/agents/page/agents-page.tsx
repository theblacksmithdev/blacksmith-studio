import { useEffect, useCallback, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useLocation } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { ListTodo, MessageSquare, Square } from 'lucide-react'
import { api } from '@/api'
import { useProjectKeys } from '@/hooks/use-project-keys'
import { useAgentStore } from '@/stores/agent-store'
import { Tooltip } from '@/components/shared/tooltip'
import { SplitPanel } from '@/components/shared/layout'
import { AgentCanvas } from '../canvas'
import { AgentChat } from '../chat'
import { AgentDetail } from '../detail'
import { AgentInnerView } from '../inner-view'
import { TaskDrawer } from '../drawer'
import { AgentMainPanel } from './agent-main-panel'
import { useAgentEvents } from './use-agent-events'
import { useConversation } from './use-conversation'
import {
  Layout, CanvasPanel, ButtonGroup, TasksBtn, ChatBtn, StopBtn, Badge, UnreadDot,
} from './styles'
import type { AgentRole } from '@/api/types'

interface AgentsPageProps {
  conversationId?: string
}

export function AgentsPage({ conversationId: propConvId }: AgentsPageProps) {
  const params = useParams()
  const conversationId = propConvId ?? params.conversationId
  const keys = useProjectKeys()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [hasUnread, setHasUnread] = useState(false)
  const [innerViewRole, setInnerViewRole] = useState<AgentRole | null>(null)
  const chatOpenRef = useRef(chatOpen)
  chatOpenRef.current = chatOpen

  const { data: agents = [] } = useQuery({
    queryKey: keys.agents,
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

  // Auto-send initial prompt from route state
  const location = useLocation()
  const initialPromptSent = useRef(false)
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null
    if (state?.initialPrompt && !initialPromptSent.current) {
      initialPromptSent.current = true
      handleSend(state.initialPrompt)
    }
  }, [location.state, handleSend])

  // Track unread messages when chat is closed
  const prevCountRef = useRef(chatMessages.length)
  useEffect(() => {
    if (chatMessages.length > prevCountRef.current && !chatOpenRef.current) {
      setHasUnread(true)
    }
    prevCountRef.current = chatMessages.length
  }, [chatMessages.length])

  const toggleChat = useCallback(() => {
    setChatOpen((v) => {
      if (!v) setHasUnread(false)
      return !v
    })
  }, [])

  const handleRespond = useCallback(async (requestId: string, value: string) => {
    removeInputRequest(requestId)
    await api.agents.respond(requestId, value)
  }, [removeInputRequest])

  const handleStop = useCallback(async () => {
    const confirmed = window.confirm(
      'Stop all running agents? This will cancel the current task and skip all remaining tasks in the pipeline.',
    )
    if (!confirmed) return
    await api.agents.cancelAll()
  }, [])

  const handleNodeClick = useCallback((role: AgentRole) => {
    selectAgent(selectedAgent === role ? null : role)
  }, [selectedAgent, selectAgent])

  const handleNodeDoubleClick = useCallback((role: AgentRole) => {
    selectAgent(null)
    setInnerViewRole(role)
  }, [selectAgent])

  const openInnerView = useCallback((role: AgentRole) => {
    selectAgent(null)
    setInnerViewRole(role)
  }, [selectAgent])

  const selectedAgentInfo = agents.find((a) => a.role === selectedAgent)
  const innerViewAgent = innerViewRole ? agents.find((a) => a.role === innerViewRole) : null
  const isProcessing = agents.some((a) => a.isRunning) || buildActive
  const hasTasks = dispatchTasks.length > 0
  const completedCount = dispatchTasks.filter((t) => t.status === 'done').length
  const hasRunning = dispatchTasks.some((t) => t.status === 'running')

  // Inner view replaces the whole page
  if (innerViewAgent) {
    return (
      <Layout>
        <AgentInnerView agent={innerViewAgent} onBack={() => setInnerViewRole(null)} />
      </Layout>
    )
  }

  const chatPanel = (
    <AgentChat onSend={handleSend} onRespond={handleRespond} isProcessing={isProcessing} />
  )

  const canvas = (
    <CanvasPanel>
      <ReactFlowProvider>
        <AgentCanvas
          agents={agents}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          conversationId={currentConvId}
        />
      </ReactFlowProvider>

      {/* Floating buttons */}
      <ButtonGroup>
        <Tooltip content={chatOpen ? 'Hide chat' : 'Show chat'}>
          <ChatBtn $active={chatOpen} onClick={toggleChat}>
            <MessageSquare size={14} />
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

        {isProcessing && (
          <Tooltip content="Stop all agents">
            <StopBtn onClick={handleStop}>
              <Square size={12} />
              Stop
            </StopBtn>
          </Tooltip>
        )}
      </ButtonGroup>

      {/* Agent detail panel */}
      {selectedAgentInfo && (
        <AgentDetail
          agent={selectedAgentInfo}
          onClose={() => selectAgent(null)}
          onOpenInnerView={() => openInnerView(selectedAgentInfo.role)}
        />
      )}
    </CanvasPanel>
  )

  const mainPanel = <AgentMainPanel canvas={canvas} conversationId={currentConvId} />

  return (
    <Layout>
      {chatOpen ? (
        <SplitPanel
          left={chatPanel}
          defaultWidth={360}
          minWidth={280}
          maxWidth={500}
          storageKey="agents.chatWidth"
        >
          {mainPanel}
        </SplitPanel>
      ) : mainPanel}

      {drawerOpen && <TaskDrawer onClose={() => setDrawerOpen(false)} />}
    </Layout>
  )
}
