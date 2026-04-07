import { useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { MessageBubble } from './message-bubble'
import { StreamingIndicator } from './streaming-indicator'
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

  return (
    <Box flex={1} overflowY="auto">
      <Box css={{
        maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto',
        padding: '32px 24px 16px',
        display: 'flex', flexDirection: 'column', gap: '20px',
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
                  margin: '4px 0 20px',
                  opacity: 0.6,
                }} />
              )}
              <MessageBubble message={msg} />
            </Box>
          )
        })}
        {isStreaming && <StreamingIndicator partialMessage={partialMessage} />}
        <Box ref={bottomRef} css={{ height: '24px' }} />
      </Box>
    </Box>
  )
}
