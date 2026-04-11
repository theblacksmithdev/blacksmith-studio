import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSessions } from '@/hooks/use-sessions'
import { useSessionStore } from '@/stores/session-store'
import { useProjectStore } from '@/stores/project-store'
import { useUiStore } from '@/stores/ui-store'
import { chatPath } from '@/router/paths'
import type { SessionSummary } from '@/types'

/* ── Helpers ── */

function groupByDate(sessions: SessionSummary[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: SessionSummary[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This week', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const s of sessions) {
    const d = new Date(s.updatedAt)
    if (d >= today) groups[0].items.push(s)
    else if (d >= yesterday) groups[1].items.push(s)
    else if (d >= weekAgo) groups[2].items.push(s)
    else groups[3].items.push(s)
  }

  return groups.filter((g) => g.items.length > 0)
}

/* ── Styled ── */

const Panel = styled.div`
  width: 260px;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--studio-bg-sidebar);
  border-right: 1px solid var(--studio-border);
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

    .delete-btn {
      opacity: 1;
    }
  }
`

const ItemIcon = styled.div`
  color: var(--studio-text-muted);
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

  &:hover {
    color: var(--studio-error);
  }
`

const Empty = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: var(--studio-text-muted);
  font-size: 13px;
`

/* ── Component ── */

export function HistoryPanel() {
  const { sessions, loadSession, deleteSession } = useSessions()
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const activeProject = useProjectStore((s) => s.activeProject)
  const close = useUiStore((s) => s.setHistoryPanelOpen)
  const navigate = useNavigate()

  const handleSelect = async (id: string) => {
    if (!activeProject) return
    await loadSession(id)
    navigate(chatPath(activeProject.id, id))
  }

  const groups = groupByDate(sessions)

  return (
    <Panel>
      <Header>
        <Title>History</Title>
        <CloseBtn onClick={() => close(false)}>
          <X size={14} />
        </CloseBtn>
      </Header>

      <Body>
        {sessions.length === 0 ? (
          <Empty>No conversations yet</Empty>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <GroupLabel>{group.label}</GroupLabel>
              {group.items.map((session) => (
                <Item
                  key={session.id}
                  active={session.id === activeSessionId}
                  onClick={() => handleSelect(session.id)}
                >
                  <ItemIcon>
                    <MessageSquare size={13} />
                  </ItemIcon>
                  <ItemBody>
                    <ItemTitle>{session.lastPrompt || session.name}</ItemTitle>
                    <ItemMeta>
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </ItemMeta>
                  </ItemBody>
                  <DeleteBtn
                    className="delete-btn"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      deleteSession(session.id)
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
    </Panel>
  )
}
