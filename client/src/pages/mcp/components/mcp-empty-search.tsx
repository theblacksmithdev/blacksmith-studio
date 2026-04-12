import { Flex, Box } from '@chakra-ui/react'
import { Search, Plus } from 'lucide-react'
import { Text } from '@/components/shared/ui'

interface McpEmptySearchProps {
  onAddCustom: () => void
}

export function McpEmptySearch({ onAddCustom }: McpEmptySearchProps) {
  return (
    <Flex direction="column" align="center" gap="14px" css={{ padding: '60px 20px', textAlign: 'center' }}>
      <Flex
        align="center"
        justify="center"
        css={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
          color: 'var(--studio-text-muted)',
        }}
      >
        <Search size={20} />
      </Flex>
      <Box>
        <Text css={{ fontSize: '15px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
          No servers found
        </Text>
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
          Try a different search or add a custom server.
        </Text>
      </Box>
      <Flex
        as="button"
        align="center"
        gap="5px"
        onClick={onAddCustom}
        css={{
          padding: '8px 16px', borderRadius: '8px',
          background: 'var(--studio-accent)', color: 'var(--studio-accent-fg)',
          fontSize: '13px', fontWeight: 500, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'opacity 0.12s ease',
          '&:hover': { opacity: 0.85 },
        }}
      >
        <Plus size={13} /> Add Custom Server
      </Flex>
    </Flex>
  )
}
