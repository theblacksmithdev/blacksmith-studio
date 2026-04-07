import styled from '@emotion/styled'
import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { SessionSummary } from '@/types'

const Wrap = styled.div`
  width: 100%;
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 10px;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.12s ease;
  font-family: inherit;

  &:hover {
    background: var(--studio-bg-surface);
  }
`

const Icon = styled.div`
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: 450;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`

const Time = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

interface RecentConversationsProps {
  sessions: SessionSummary[]
  onSelect: (sessionId: string) => void
}

export function RecentConversations({ sessions, onSelect }: RecentConversationsProps) {
  if (sessions.length === 0) return null

  return (
    <Wrap>
      <Label>Recent</Label>
      <List>
        {sessions.map((session) => (
          <Item key={session.id} onClick={() => onSelect(session.id)}>
            <Icon>
              <MessageSquare size={14} />
            </Icon>
            <Title>{session.lastPrompt || session.name}</Title>
            <Time>
              {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
            </Time>
          </Item>
        ))}
      </List>
    </Wrap>
  )
}
