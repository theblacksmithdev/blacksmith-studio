import styled from '@emotion/styled'
import { MessageSquare, Network, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Text, Badge, Avatar, spacing, radii } from '@/components/shared/ui'
import type { SessionSummary } from '@/types'

interface RecentItem {
  id: string
  title: string
  type: 'chat' | 'agents'
  updatedAt: string
  meta?: string
}

const Wrap = styled.div`
  width: 100%;
`

const Label = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: ${spacing.sm};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing['2xs']};
`

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radii.lg};
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
    .item-arrow { opacity: 1; transform: translateX(0); }
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: 1px;
`

const Arrow = styled.div`
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.12s ease;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  display: flex;
`

interface RecentListProps {
  sessions: SessionSummary[]
  agentConvs: any[]
  onSelectSession: (id: string) => void
  onSelectConversation: (id: string) => void
}

export function RecentList({ sessions, agentConvs, onSelectSession, onSelectConversation }: RecentListProps) {
  // Merge and sort by updatedAt
  const items: RecentItem[] = [
    ...sessions.map((s) => ({
      id: s.id,
      title: s.lastPrompt || s.name,
      type: 'chat' as const,
      updatedAt: s.updatedAt,
    })),
    ...agentConvs.map((c) => ({
      id: c.id,
      title: c.title,
      type: 'agents' as const,
      updatedAt: c.updatedAt,
      meta: `${c.messageCount} messages`,
    })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  if (items.length === 0) return null

  return (
    <Wrap>
      <Label>Recent</Label>
      <List>
        {items.map((item) => (
          <Item
            key={`${item.type}-${item.id}`}
            onClick={() => item.type === 'chat' ? onSelectSession(item.id) : onSelectConversation(item.id)}
          >
            <Avatar
              size="sm"
              variant={item.type === 'agents' ? 'active' : 'default'}
              icon={item.type === 'chat' ? <MessageSquare /> : <Network />}
            />
            <Body>
              <Text variant="label" truncate css={{ display: 'block', color: 'var(--studio-text-primary)', fontWeight: 450 }}>
                {item.title}
              </Text>
              <Meta>
                <Badge variant={item.type === 'agents' ? 'success' : 'default'} size="sm">
                  {item.type === 'chat' ? 'Chat' : 'Team'}
                </Badge>
                {item.meta && <Text variant="caption" color="muted">{item.meta} ·</Text>}
                <Text variant="caption" color="muted">
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </Text>
              </Meta>
            </Body>
            <Arrow className="item-arrow"><ArrowRight size={13} /></Arrow>
          </Item>
        ))}
      </List>
    </Wrap>
  )
}
