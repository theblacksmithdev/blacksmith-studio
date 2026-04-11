import type { ReactNode } from 'react'
import styled from '@emotion/styled'
import { Text, spacing } from '@/components/shared/ui'

const Section = styled.div`
  padding: ${spacing.xl};
  border-bottom: 1px solid var(--studio-border);

  &:last-child { border-bottom: none; }
`

const Header = styled.div`
  margin-bottom: ${spacing.lg};
`

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Section>
      <Header>
        <Text variant="subtitle">{title}</Text>
        {description && <Text variant="caption" color="muted" css={{ marginTop: spacing['2xs'] }}>{description}</Text>}
      </Header>
      {children}
    </Section>
  )
}
