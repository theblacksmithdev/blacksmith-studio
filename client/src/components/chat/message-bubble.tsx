import { memo, useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { Copy, Check } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { Text, IconButton, Tooltip, spacing, radii } from '@/components/shared/ui'
import { ToolCallCard } from './tool-call-card'
import { ClaudeHeader } from './claude-header'
import type { Message } from '@/types'

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tooltip content={copied ? 'Copied' : 'Copy'}>
      <IconButton variant="ghost" size="xs" onClick={handleCopy} aria-label="Copy message">
        {copied ? <Check /> : <Copy />}
      </IconButton>
    </Tooltip>
  )
}

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const time = message.timestamp ? formatTime(message.timestamp) : null

  if (isUser) {
    return (
      <Flex direction="column" align="flex-end" gap={spacing.xs} css={{
        '@keyframes bubbleIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        animation: 'bubbleIn 0.2s ease',
      }}>
        <Box css={{
          maxWidth: '75%',
          position: 'relative',
          '&:hover .msg-actions': { opacity: 1 },
        }}>
          <Box css={{
            padding: `${spacing.sm} ${spacing.lg}`,
            borderRadius: `${radii['2xl']} ${radii['2xl']} ${radii.xs} ${radii['2xl']}`,
            background: 'var(--studio-accent)',
            color: 'var(--studio-accent-fg)',
          }}>
            <Text variant="body" css={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'inherit' }}>
              {message.content}
            </Text>
          </Box>

          <Flex
            className="msg-actions"
            align="center"
            gap={spacing.xs}
            css={{
              position: 'absolute',
              bottom: `-${spacing.xl}`,
              right: 0,
              opacity: 0,
              transition: 'opacity 0.15s ease',
            }}
          >
            <CopyButton content={message.content} />
          </Flex>
        </Box>

        {time && <Text variant="tiny" color="muted">{time}</Text>}
      </Flex>
    )
  }

  // Assistant message
  return (
    <Flex direction="column" gap={spacing.xs} css={{
      '@keyframes bubbleIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      animation: 'bubbleIn 0.2s ease',
      position: 'relative',
      '&:hover .msg-actions': { opacity: 1 },
    }}>
      <ClaudeHeader extra={time ? <Text variant="tiny" color="muted">{time}</Text> : undefined} />

      <Box css={{ paddingLeft: '30px' }}>
        <MarkdownRenderer content={message.content} />

        {message.toolCalls && message.toolCalls.length > 0 && (
          <Flex direction="column" gap={spacing.xs} css={{ marginTop: spacing.sm }}>
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.toolId} toolCall={tc} />
            ))}
          </Flex>
        )}
      </Box>

      <Flex
        className="msg-actions"
        align="center"
        gap={spacing.xs}
        css={{
          position: 'absolute',
          top: 0,
          right: 0,
          opacity: 0,
          transition: 'opacity 0.15s ease',
        }}
      >
        <CopyButton content={message.content} />
      </Flex>
    </Flex>
  )
})
