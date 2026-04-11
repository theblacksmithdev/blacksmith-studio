import { Box, Text, HStack } from '@chakra-ui/react'
import { User, Sparkles } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { ToolCallCard } from './tool-call-card'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <Box css={{ animation: 'fadeIn 0.25s ease', padding: '2px 0' }}>
      {isUser ? (
        <Box css={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            css={{
              maxWidth: '80%',
              padding: '10px 16px',
              borderRadius: '18px 18px 4px 18px',
              background: 'var(--studio-bg-surface)',
              border: '1px solid var(--studio-border)',
            }}
          >
            <Text css={{
              fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              color: 'var(--studio-text-primary)',
            }}>
              {message.content}
            </Text>
          </Box>
        </Box>
      ) : (
        <Box css={{ maxWidth: '100%' }}>
          {/* Claude header */}
          <HStack gap={2} css={{ marginBottom: '8px' }}>
            <Box css={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--studio-green-border), var(--studio-green-subtle))',
              border: '1px solid var(--studio-green-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={11} style={{ color: 'var(--studio-green)' }} />
            </Box>
            <Text css={{
              fontSize: '12px', fontWeight: 600, color: 'var(--studio-text-secondary)',
              letterSpacing: '-0.01em',
            }}>
              Claude
            </Text>
          </HStack>

          {/* Content */}
          <Box css={{ paddingLeft: '30px' }}>
            <MarkdownRenderer content={message.content} />
            {message.toolCalls && message.toolCalls.length > 0 && (
              <Box css={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {message.toolCalls.map((tc) => (
                  <ToolCallCard key={tc.toolId} toolCall={tc} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}
