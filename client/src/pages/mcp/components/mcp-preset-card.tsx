import { Flex, Box } from '@chakra-ui/react'
import { Check } from 'lucide-react'
import { Text, Badge } from '@/components/shared/ui'
import type { McpPreset } from '@/pages/settings/components/mcp-library/presets'

interface McpPresetCardProps {
  preset: McpPreset
  installed: boolean
  onClick: () => void
}

export function McpPresetCard({ preset, installed, onClick }: McpPresetCardProps) {
  const Icon = preset.icon

  return (
    <Flex
      direction="column"
      as="button"
      onClick={installed ? undefined : onClick}
      css={{
        padding: '18px',
        borderRadius: '12px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-sidebar)',
        cursor: installed ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        fontFamily: 'inherit',
        '&:hover': installed ? {} : {
          borderColor: 'var(--studio-border-hover)',
          background: 'var(--studio-bg-surface)',
          transform: 'translateY(-1px)',
          boxShadow: 'var(--studio-shadow)',
        },
      }}
    >
      {/* Top: Icon + Name + Installed badge */}
      <Flex align="center" gap="10px" css={{ marginBottom: '10px' }}>
        <Flex
          align="center"
          justify="center"
          css={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--studio-bg-main)', border: '1px solid var(--studio-border)',
            color: installed ? 'var(--studio-text-muted)' : 'var(--studio-text-secondary)',
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </Flex>
        <Box css={{ flex: 1, minWidth: 0 }}>
          <Text css={{
            fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em',
            color: installed ? 'var(--studio-text-tertiary)' : 'var(--studio-text-primary)',
          }}>
            {preset.label}
          </Text>
          <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', fontFamily: "'SF Mono', monospace" }}>
            {preset.name}
          </Text>
        </Box>
        {installed && (
          <Flex align="center" gap="3px" css={{
            padding: '2px 7px', borderRadius: '5px',
            background: 'var(--studio-bg-hover)', flexShrink: 0,
          }}>
            <Check size={10} style={{ color: 'var(--studio-text-muted)' }} />
            <Text css={{ fontSize: '11px', fontWeight: 500, color: 'var(--studio-text-muted)' }}>Added</Text>
          </Flex>
        )}
      </Flex>

      {/* Description */}
      <Text css={{
        fontSize: '13px', lineHeight: 1.6, flex: 1,
        color: installed ? 'var(--studio-text-muted)' : 'var(--studio-text-tertiary)',
      }}>
        {preset.description}
      </Text>

      {/* Env hint */}
      {preset.envHint && !installed && (
        <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
          {preset.envHint}
        </Text>
      )}

      {/* Footer */}
      <Flex align="center" justify="space-between" css={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--studio-border)' }}>
        <Badge variant="default" size="sm">{preset.category}</Badge>
        {!installed && (
          <Text css={{ fontSize: '12px', fontWeight: 500, color: 'var(--studio-accent)' }}>
            Add to project
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
