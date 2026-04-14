import { Box } from '@chakra-ui/react'
import { BotMessageSquare } from 'lucide-react'

export function ClaudeIcon({ size = 22 }: { size?: number }) {
  return (
    <Box
      css={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: 'var(--studio-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <BotMessageSquare
        size={Math.round(size * 0.55)}
        color="var(--studio-accent-fg)"
      />
    </Box>
  )
}
