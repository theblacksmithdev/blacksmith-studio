import { useState } from 'react'
import styled from '@emotion/styled'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Network, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSessionsQuery, useSessionQuery, useDeleteSession } from '@/api/hooks/sessions'
import { useAgentConversationsQuery, useDeleteAgentConversation } from '@/api/hooks/agents'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { useSessionStore } from '@/stores/session-store'
import { useChatStore } from '@/stores/chat-store'
import { useUiStore } from '@/stores/ui-store'
import { chatPath, agentsConversationPath } from '@/router/paths'
import { ConfirmDialog } from '@/components/shared/ui'

/* ── Types ── */

interface HistoryItem {
  id: string
  title: string
  updatedAt: string
}

/* ── Helpers ── */

function groupByDate(items: HistoryItem[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This week', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const item of items) {
    const d = new Date(item.updatedAt)
    if (d >= today) groups[0].items.push(item)
    else if (d >= yesterday) groups[1].items.push(item)
    else if (d >= weekAgo) groups[2].items.push(item)
    else groups[3].items.push(item)
  }

  return groups.filter((g) => g.items.length > 0)
}

/* ── Styled ── */

const Panel = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--studio-bg-sidebar);
  /* border managed by SplitPanel handle */
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const Title = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--studio-text-secondary);
  flex: 1;
`

const CloseBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`

const GroupLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
  padding: 8px 8px 4px;
`

const Item = styled.button<{ active: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: var(--studio-text-primary);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.1s ease;

  &:hover {
    background: var(--studio-bg-surface);
    .delete-btn { opacity: 1; }
  }
`

const ItemIcon = styled.div<{ $accent?: boolean }>`
  color: ${({ $accent }) => $accent ? 'var(--studio-green)' : 'var(--studio-text-muted)'};
  flex-shrink: 0;
  margin-top: 2px;
`

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemTitle = styled.div`
  font-size: 13px;
  font-weight: 450;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ItemMeta = styled.div`
  font-size: 12px;
  color: var(--studio-text-muted);
  margin-top: 2px;
`

const DeleteBtn = styled.span`
  opacity: 0;
  color: var(--studio-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.1s ease;

  &:hover { color: var(--studio-error); }
`

const Empty = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 13px;
`

/* ── Component ── */

export function HistoryPanel() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: sessionsData } = useSessionsQuery()
  const deleteSessionMutation = useDeleteSession()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { setActiveSession } = useSessionStore()
  const { loadMessages } = useChatStore()
  const pid = useActiveProjectId()
  const close = useUiStore((s) => s.setHistoryPanelOpen)

  const isAgents = location.pathname.includes('/agents')
  const { data: agentConvs = [] } = useAgentConversationsQuery()
  const deleteAgentConvMutation = useDeleteAgentConversation()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const sessions = sessionsData?.items ?? []

  const items: HistoryItem[] = isAgents
    ? agentConvs.map((c: any) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt }))
    : sessions.map((s) => ({ id: s.id, title: s.lastPrompt || s.name, updatedAt: s.updatedAt }))

  const groups = groupByDate(items)

  const handleSelect = async (id: string) => {
    if (!pid) return
    if (isAgents) {
      navigate(agentsConversationPath(pid, id))
    } else {
      const { api } = await import('@/api')
      const session = await api.sessions.get({ id })
      setActiveSession(session.id)
      loadMessages(session.messages)
      navigate(chatPath(pid, id))
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    if (isAgents) {
      deleteAgentConvMutation.mutate(deleteTarget)
    } else {
      deleteSessionMutation.mutate(deleteTarget)
    }
    setDeleteTarget(null)
  }

  const Icon = isAgents ? Network : MessageSquare
  const label = isAgents ? 'Team History' : 'Chat History'
  const emptyText = isAgents ? 'No team sessions yet' : 'No conversations yet'

  return (
    <Panel>
      <Header>
        <Title>{label}</Title>
        <CloseBtn onClick={() => close(false)}>
          <X size={14} />
        </CloseBtn>
      </Header>

      <Body>
        {items.length === 0 ? (
          <Empty>{emptyText}</Empty>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <GroupLabel>{group.label}</GroupLabel>
              {group.items.map((item) => (
                <Item
                  key={item.id}
                  active={!isAgents && item.id === activeSessionId}
                  onClick={() => handleSelect(item.id)}
                >
                  <ItemIcon $accent={isAgents}>
                    <Icon size={13} />
                  </ItemIcon>
                  <ItemBody>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemMeta>
                      {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                    </ItemMeta>
                  </ItemBody>
                  <DeleteBtn
                    className="delete-btn"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      setDeleteTarget(item.id)
                    }}
                  >
                    <Trash2 size={12} />
                  </DeleteBtn>
                </Item>
              ))}
            </div>
          ))
        )}
      </Body>

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete this ${isAgents ? 'team session' : 'conversation'}?`}
          description="This cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Panel>
  )
}
