import { useState, useEffect } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { ToolCallCard } from './tool-call-card'
import { useChatStore } from '@/stores/chat-store'

interface StreamingIndicatorProps {
  partialMessage: string | null
}

export function StreamingIndicator({ partialMessage }: StreamingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0)
  const currentToolCalls = useChatStore((s) => s.currentToolCalls)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeLabel = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`

  return (
    <Box css={{ animation: 'fadeIn 0.2s ease', padding: '2px 0' }}>
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
        <Text css={{ fontSize: '12px', fontWeight: 600, color: 'var(--studio-text-secondary)', letterSpacing: '-0.01em' }}>
          Claude
        </Text>
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
          {timeLabel}
        </Text>
      </HStack>

      <Box css={{ paddingLeft: '30px' }}>
        {/* Tool calls in progress */}
        {currentToolCalls.length > 0 && (
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
            {currentToolCalls.map((tc) => (
              <ToolCallCard key={tc.toolId} toolCall={tc} isActive />
            ))}
          </Box>
        )}

        {partialMessage ? (
          <Box css={{ position: 'relative' }}>
            <MarkdownRenderer content={partialMessage} />
            <Box as="span" css={{
              display: 'inline-block', width: '2px', height: '16px',
              background: 'var(--studio-green)', marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'cursorBlink 1s step-end infinite',
            }} />
          </Box>
        ) : currentToolCalls.length === 0 ? (
          <HStack gap={2} css={{ padding: '4px 0' }}>
            <Box css={{
              width: '100%', maxWidth: '120px', height: '3px', borderRadius: '2px',
              background: 'linear-gradient(90deg, var(--studio-green), transparent)',
              animation: 'shimmerBar 1.5s ease infinite',
              opacity: 0.5,
            }} />
            <Text css={{ fontSize: '12px', color: 'var(--studio-text-muted)', flexShrink: 0 }}>
              Thinking...
            </Text>
          </HStack>
        ) : null}
      </Box>
    </Box>
  )
}
