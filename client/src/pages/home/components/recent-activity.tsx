import styled from '@emotion/styled'
import { MessageSquare, Network, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Text, Badge, Avatar, VStack, spacing, radii } from '@/components/shared/ui'
import type { SessionSummary } from '@/types'

const Item = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radii.lg};
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
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
  margin-top: 2px;
`

const Arrow = styled.div`
  color: var(--studio-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s ease;
  display: flex;
  flex-shrink: 0;
`

interface RecentActivityProps {
  sessions: SessionSummary[]
  agentConvs: any[]
  onSelectSession: (id: string) => void
  onSelectConversation: (id: string) => void
}

export function RecentActivity({ sessions, agentConvs, onSelectSession, onSelectConversation }: RecentActivityProps) {
  return (
    <VStack gap="md" css={{ width: '100%' }}>
      <Text variant="tiny" color="muted" css={{ width: '100%' }}>
        Recent
      </Text>

      <VStack gap="2xs" css={{ width: '100%' }}>
        {sessions.map((s) => (
          <Item key={`chat-${s.id}`} onClick={() => onSelectSession(s.id)}>
            <Avatar size="sm" variant="default" icon={<MessageSquare />} />
            <Body>
              <Text variant="label" truncate css={{ display: 'block' }}>{s.lastPrompt || s.name}</Text>
              <Meta>
                <Badge variant="default" size="sm">Chat</Badge>
                <Text variant="caption" color="muted">
                  {formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}
                </Text>
              </Meta>
            </Body>
            <Arrow className="item-arrow"><ArrowRight size={13} /></Arrow>
          </Item>
        ))}

        {agentConvs.map((c) => (
          <Item key={`agent-${c.id}`} onClick={() => onSelectConversation(c.id)}>
            <Avatar size="sm" variant="active" icon={<Network />} />
            <Body>
              <Text variant="label" truncate css={{ display: 'block' }}>{c.title}</Text>
              <Meta>
                <Badge variant="success" size="sm">Team</Badge>
                <Text variant="caption" color="muted">
                  {c.messageCount} messages &middot; {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                </Text>
              </Meta>
            </Body>
            <Arrow className="item-arrow"><ArrowRight size={13} /></Arrow>
          </Item>
        ))}
      </VStack>
    </VStack>
  )
}
