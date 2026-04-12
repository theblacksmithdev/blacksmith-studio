import { useRef, useEffect } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { MessageSquare } from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { StreamingIndicator } from './streaming-indicator'
import { EmptyState, spacing } from '@/components/shared/ui'
import type { Message } from '@/types'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  partialMessage: string | null
}

export function MessageList({ messages, isStreaming, partialMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partialMessage])

  if (messages.length === 0 && !isStreaming) {
    return (
      <Flex css={{ flex: 1 }}>
        <EmptyState compact icon={<MessageSquare />} description="Send a message to start the conversation" />
      </Flex>
    )
  }

  return (
    <Box flex={1} overflowY="auto">
      <Box css={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: `${spacing['3xl']} ${spacing.xl} ${spacing.md}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xl,
      }}>
        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1]
          const showSeparator = i > 0 && msg.role === 'user' && prevMsg?.role === 'assistant'
          return (
            <Box key={msg.id}>
              {showSeparator && (
                <Box css={{
                  height: '1px',
                  background: 'var(--studio-border)',
                  margin: `${spacing.xs} 0 ${spacing.xl}`,
                  opacity: 0.5,
                }} />
              )}
              <MessageBubble message={msg} />
            </Box>
          )
        })}
        {isStreaming && <StreamingIndicator partialMessage={partialMessage} />}
        <Box ref={bottomRef} css={{ height: spacing.xl }} />
      </Box>
    </Box>
  )
}
