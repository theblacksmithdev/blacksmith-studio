import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'

interface SettingsSectionProps {
  title: string
  description: string
  children: ReactNode
  onReset?: () => void
}

export function SettingsSection({ title, description, children, onReset }: SettingsSectionProps) {
  return (
    <VStack gap={0} align="stretch">
      <HStack css={{ marginBottom: '16px', alignItems: 'flex-start' }}>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
            {title}
          </Text>
          <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)' }}>
            {description}
          </Text>
        </Box>
        {onReset && (
          <Box
            as="button"
            onClick={onReset}
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--studio-text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              flexShrink: 0,
              marginTop: '2px',
              '&:hover': {
                background: 'var(--studio-bg-surface)',
                color: 'var(--studio-text-secondary)',
              },
            }}
          >
            <RotateCw size={11} />
            Reset
          </Box>
        )}
      </HStack>
      <VStack
        gap={0}
        align="stretch"
        css={{
          borderRadius: '10px',
          border: '1px solid var(--studio-border)',
          overflow: 'hidden',
          background: 'var(--studio-bg-sidebar)',
        }}
      >
        {children}
      </VStack>
    </VStack>
  )
}
