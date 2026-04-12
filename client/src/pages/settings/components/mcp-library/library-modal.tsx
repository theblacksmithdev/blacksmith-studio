import { useState } from 'react'
import { Box, Flex, HStack, Input, Button, Text } from '@chakra-ui/react'
import { Search, Plus } from 'lucide-react'
import type { McpServerConfig, McpServerEntry } from '@/api/modules/mcp'
import { Modal, SecondaryButton } from '@/components/shared/modal'
import { McpServerModal } from '@/pages/mcp/components/mcp-server-modal'
import { PRESETS, CATEGORIES } from './presets'
import { ServerListItem } from './server-list-item'

interface McpLibraryModalProps {
  existingNames: Set<string>
  onAdd: (name: string, config: McpServerConfig) => void
  onClose: () => void
}

export function McpLibraryModal({ existingNames, onAdd, onClose }: McpLibraryModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [configuring, setConfiguring] = useState<typeof PRESETS[number] | null>(null)
  const [showCustom, setShowCustom] = useState(false)

  const filtered = PRESETS.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.name.includes(q)
    }
    return true
  })

  if (configuring) {
    const presetEntry: McpServerEntry = {
      name: configuring.name,
      transport: 'command' in configuring.config ? 'stdio' : 'http',
      config: configuring.config,
      enabled: true,
      status: 'unknown',
    }
    return (
      <McpServerModal
        server={presetEntry}
        onSave={(name, config) => { onAdd(name, config); setConfiguring(null) }}
        onClose={() => setConfiguring(null)}
      />
    )
  }

  if (showCustom) {
    return (
      <McpServerModal
        onSave={(name, config) => { onAdd(name, config); setShowCustom(false) }}
        onClose={() => setShowCustom(false)}
      />
    )
  }

  return (
    <Modal
      title="Add MCP Server"
      onClose={onClose}
      width="560px"
      footer={
        <SecondaryButton onClick={() => setShowCustom(true)}>
          <Plus size={13} />
          Custom Server
        </SecondaryButton>
      }
    >
      <Box css={{ margin: '-20px', display: 'flex', flexDirection: 'column' }}>
        {/* Search */}
        <Flex
          align="center"
          gap={2}
          css={{ padding: '10px 20px', borderBottom: '1px solid var(--studio-border)' }}
        >
          <Search size={14} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search servers..."
            autoFocus
            css={{ fontSize: '14px', color: 'var(--studio-text-primary)', border: 'none', outline: 'none', background: 'transparent', '&:focus': { boxShadow: 'none' }, '&::placeholder': { color: 'var(--studio-text-muted)' } }}
          />
        </Flex>

        {/* Categories */}
        <HStack
          gap={1}
          css={{ padding: '10px 20px', borderBottom: '1px solid var(--studio-border)', flexWrap: 'wrap' }}
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="xs"
              variant="ghost"
              onClick={() => setCategory(cat.id)}
              css={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: category === cat.id ? 500 : 400,
                background: category === cat.id ? 'var(--studio-bg-hover)' : 'transparent',
                color: category === cat.id ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)',
                '&:hover': { color: 'var(--studio-text-secondary)' },
              }}
            >
              {cat.label}
            </Button>
          ))}
        </HStack>

        {/* Server list */}
        <Box css={{ overflowY: 'auto', padding: '8px', maxHeight: '400px' }}>
          {filtered.map((preset) => (
            <ServerListItem
              key={preset.name}
              preset={preset}
              added={existingNames.has(preset.name)}
              onClick={() => setConfiguring(preset)}
            />
          ))}
          {filtered.length === 0 && (
            <Text css={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
              No servers match your search.
            </Text>
          )}
        </Box>
      </Box>
    </Modal>
  )
}
