import { Box, Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Text } from '@/components/shared/ui'

interface SettingRowProps {
  label: string
  description?: ReactNode
  /** Renders children below the label (full width) instead of inline right */
  fullWidth?: boolean
  children: ReactNode
}

export function SettingRow({ label, description, fullWidth, children }: SettingRowProps) {
  if (fullWidth) {
    return (
      <Box
        css={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--studio-border)',
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: description ? '2px' : '10px' }}>
          {label}
        </Text>
        {description && (
          <Box css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', marginBottom: '10px', lineHeight: 1.5 }}>
            {description}
          </Box>
        )}
        {children}
      </Box>
    )
  }

  return (
    <Flex
      align="center"
      gap="16px"
      css={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--studio-border)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
          {label}
        </Text>
        {description && (
          <Box css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', marginTop: '2px', lineHeight: 1.5 }}>
            {description}
          </Box>
        )}
      </Box>
      <Box css={{ flexShrink: 0 }}>
        {children}
      </Box>
    </Flex>
  )
}
