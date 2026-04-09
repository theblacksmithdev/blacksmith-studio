import { useEffect, useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styled from '@emotion/styled'
import { ReactFlowProvider } from '@xyflow/react'
import { ListTodo } from 'lucide-react'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useAgentStore } from '@/stores/agent-store'
import { Tooltip } from '@/components/shared/tooltip'
import { AgentCanvas } from './agent-canvas'
import { AgentChat } from './agent-chat'
import { AgentDetail } from './agent-detail'
import { TaskDrawer } from './task-drawer'
import type { AgentRole } from '@/api/types'

const Layout = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--studio-bg-main);
`

const ChatPanel = styled.div`
  width: 320px;
  flex-shrink: 0;
`

const CanvasPanel = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`

const TasksBtn = styled.button<{ $active: boolean; $hasTasks: boolean }>`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(16, 163, 127, 0.3)' : 'var(--studio-border)'};
  background: var(--studio-bg-surface);
  color: ${({ $active }) => $active ? 'var(--studio-green)' : 'var(--studio-text-secondary)'};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  opacity: ${({ $hasTasks }) => $hasTasks ? 1 : 0.5};

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Badge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--studio-bg-hover);
  color: var(--studio-text-muted);
`

export function AgentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: agents = [] } = useQuery({
    queryKey: queryKeys.agents,
    queryFn: () => api.agents.list(),
  })

  const setAgents = useAgentStore((s) => s.setAgents)
  const handleAgentEvent = useAgentStore((s) => s.handleAgentEvent)
  const handleBuildEvent = useAgentStore((s) => s.handleBuildEvent)
  const addInputRequest = useAgentStore((s) => s.addInputRequest)
  const removeInputRequest = useAgentStore((s) => s.removeInputRequest)
  const addChatMessage = useAgentStore((s) => s.addChatMessage)
  const selectedAgent = useAgentStore((s) => s.selectedAgent)
  const selectAgent = useAgentStore((s) => s.selectAgent)
  const buildActive = useAgentStore((s) => s.buildActive)
  const dispatchTasks = useAgentStore((s) => s.dispatchTasks)
  const loadPersistedChat = useAgentStore((s) => s.loadPersistedChat)
  const chatMessages = useAgentStore((s) => s.chatMessages)

  useEffect(() => {
    if (agents.length > 0) setAgents(agents)
  }, [agents, setAgents])

  // Load persisted chat on mount
  useEffect(() => {
    if (chatMessages.length === 0) {
      api.agents.listChat().then((messages) => {
        if (messages.length > 0) {
          loadPersistedChat(messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            agentRole: m.agentRole,
            content: m.content,
            timestamp: m.timestamp,
          })))
        }
      }).catch(() => { /* ignore */ })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsubs = [
      api.agents.onEvent((event) => {
        handleAgentEvent(event)

        if (event.data.type === 'activity') {
          addChatMessage({
            role: 'agent',
            agentRole: event.agentId as AgentRole,
            content: event.data.description,
          })
        } else if (event.data.type === 'done') {
          addChatMessage({
            role: 'system',
            content: `${event.agentId.replace(/-/g, ' ')} completed — $${event.data.costUsd?.toFixed(4) ?? '0'}`,
          })
        } else if (event.data.type === 'error') {
          addChatMessage({
            role: 'system',
            content: `${event.agentId.replace(/-/g, ' ')}: ${event.data.error}`,
          })
        }
      }),
      api.agents.onBuildEvent((event) => {
        handleBuildEvent(event)
        addChatMessage({ role: 'system', content: event.data.message })
      }),
      api.agents.onInputRequest((request) => {
        addInputRequest(request)
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [handleAgentEvent, handleBuildEvent, addInputRequest, addChatMessage])

  const handleSend = useCallback(async (message: string) => {
    addChatMessage({ role: 'user', content: message })

    try {
      const result = await api.agents.dispatch(message)

      const totalCost = result.executions.reduce((sum, e) => sum + e.costUsd, 0)
      if (totalCost > 0) {
        addChatMessage({ role: 'system', content: `All tasks finished — total $${totalCost.toFixed(4)}` })
      }
    } catch (err: any) {
      addChatMessage({ role: 'system', content: `Error: ${err.message}` })
    }
  }, [addChatMessage])

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
        <AgentChat
          onSend={handleSend}
          onRespond={handleRespond}
          isProcessing={isProcessing}
        />
      </ChatPanel>

      <CanvasPanel>
        <ReactFlowProvider>
          <AgentCanvas agents={agents} onNodeClick={handleNodeClick} />
        </ReactFlowProvider>

        {/* Always-visible tasks button */}
        <Tooltip content="View task plan">
          <TasksBtn
            $active={hasRunning}
            $hasTasks={hasTasks}
            onClick={() => setDrawerOpen(true)}
          >
            <ListTodo size={14} />
            Tasks
            {hasTasks && <Badge>{completedCount}/{dispatchTasks.length}</Badge>}
          </TasksBtn>
        </Tooltip>
      </CanvasPanel>

      {selectedAgentInfo && (
        <AgentDetail
          agent={selectedAgentInfo}
          onClose={() => selectAgent(null)}
        />
      )}

      {drawerOpen && (
        <TaskDrawer onClose={() => setDrawerOpen(false)} />
      )}
    </Layout>
  )
}
