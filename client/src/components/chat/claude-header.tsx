import { Flex, Box } from '@chakra-ui/react'
import { BotMessageSquare } from 'lucide-react'
import { Text, spacing } from '@/components/shared/ui'

function ClaudeAvatar({ size = 24 }: { size?: number }) {
  return (
    <Box css={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${Math.round(size * 0.28)}px`,
      background: 'var(--studio-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <BotMessageSquare size={Math.round(size * 0.55)} color="var(--studio-accent-fg)" />
    </Box>
  )
}

interface ClaudeHeaderProps {
  extra?: React.ReactNode
  size?: 'sm' | 'md'
}

export function ClaudeHeader({ extra, size = 'sm' }: ClaudeHeaderProps) {
  return (
    <Flex align="center" gap={spacing.sm}>
      <ClaudeAvatar size={size === 'md' ? 28 : 22} />
      <Text
        variant={size === 'md' ? 'subtitle' : 'bodySmall'}
        css={{ fontWeight: 600, color: 'var(--studio-text-secondary)', letterSpacing: '-0.01em' }}
      >
        Claude
      </Text>
      {extra}
    </Flex>
  )
}

export { ClaudeAvatar }
