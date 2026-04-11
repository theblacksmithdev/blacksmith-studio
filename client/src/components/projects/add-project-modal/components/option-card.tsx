import { Box } from '@chakra-ui/react'
import { Text, Avatar, Card, spacing } from '@/components/shared/ui'
import type { ReactNode } from 'react'

interface OptionCardProps {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}

export function OptionCard({ icon, title, description, onClick }: OptionCardProps) {
  return (
    <Card variant="interactive" p={`${spacing.md} ${spacing.lg}`} css={{ display: 'flex', alignItems: 'center', gap: spacing.md, cursor: 'pointer' }} onClick={onClick}>
      <Avatar size="md" variant="default" icon={icon} />
      <Box css={{ flex: 1 }}>
        <Text variant="label" css={{ color: 'var(--studio-text-primary)', fontWeight: 500, display: 'block' }}>{title}</Text>
        <Text variant="caption" color="tertiary">{description}</Text>
      </Box>
    </Card>
  )
}
