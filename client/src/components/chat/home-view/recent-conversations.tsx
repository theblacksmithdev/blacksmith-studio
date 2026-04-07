import styled from '@emotion/styled'
import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { SessionSummary } from '@/types'

const Card = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
  }
`

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--studio-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
`

const MetaText = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
`

interface RecentConversationsProps {
  sessions: SessionSummary[]
  onSelect: (sessionId: string) => void
}

export function RecentConversations({ sessions, onSelect }: RecentConversationsProps) {
  if (sessions.length === 0) return null

  return (
    <Box w="full">
      <HStack gap={2} mb={3}>
        <Clock size={12} style={{ color: 'var(--studio-text-muted)' }} />
        <Text fontSize="11px" fontWeight={600} textTransform="uppercase" letterSpacing="0.08em" color="var(--studio-text-tertiary)">
          Recent conversations
        </Text>
      </HStack>

      <SimpleGrid columns={2} gap={2}>
        {sessions.map((session) => (
          <Card key={session.id} onClick={() => onSelect(session.id)}>
            <MessageSquare size={14} style={{
              color: 'var(--studio-text-muted)', flexShrink: 0, marginTop: 2,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <CardTitle>{session.lastPrompt || session.name}</CardTitle>
              <HStack gap={2}>
                <MetaText>
                  {session.messageCount} msg{session.messageCount !== 1 ? 's' : ''}
                </MetaText>
                <MetaText>
                  {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                </MetaText>
              </HStack>
            </div>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  )
}
