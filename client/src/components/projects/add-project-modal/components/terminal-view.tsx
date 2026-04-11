import { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { Loader2, Check } from 'lucide-react'
import { Text, Badge, VStack, HStack, spacing, radii } from '@/components/shared/ui'

interface TerminalViewProps {
  lines: string[]
  status: 'running' | 'success'
  label: string
}

export function TerminalView({ lines, status, label }: TerminalViewProps) {
  const logEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  return (
    <VStack gap="md">
      <Box css={{ background: 'var(--studio-code-bg)', borderRadius: radii.lg, border: '1px solid var(--studio-border)', overflow: 'hidden' }}>
        <HStack gap="sm" css={{ padding: `${spacing.sm} ${spacing.md}`, borderBottom: '1px solid var(--studio-border)' }}>
          <Loader2 size={13} style={{
            color: status === 'success' ? 'var(--studio-green)' : 'var(--studio-text-tertiary)',
            animation: status === 'running' ? 'spin 1s linear infinite' : 'none',
          }} />
          <Text variant="bodySmall" color="secondary">{label}</Text>
        </HStack>
        <Box css={{
          padding: spacing.md, maxHeight: '220px', overflowY: 'auto',
          fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace", fontSize: '12px',
          lineHeight: '18px', color: 'var(--studio-text-secondary)',
        }}>
          {lines.map((line, i) => <Box key={i} css={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</Box>)}
          {status === 'running' && lines.length === 0 && <Text variant="caption" color="muted" css={{ fontStyle: 'italic' }}>Waiting for output...</Text>}
          <div ref={logEndRef} />
        </Box>
      </Box>

      {status === 'success' && (
        <Badge variant="success" size="md" css={{ padding: `${spacing.sm} ${spacing.md}`, width: '100%', justifyContent: 'center' }}>
          <Check size={13} /> Done! Redirecting...
        </Badge>
      )}
    </VStack>
  )
}
