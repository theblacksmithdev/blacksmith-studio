import type { ReactNode } from 'react'
import styled from '@emotion/styled'
import { Text, spacing } from '@/components/shared/ui'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.xl};
  padding: ${spacing.sm} 0;
`

const LabelGroup = styled.div`
  flex: 0 0 140px;
  padding-top: ${spacing['2xs']};
`

const Control = styled.div`
  flex: 1;
  min-width: 0;
`

interface SettingsRowProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <Row>
      <LabelGroup>
        <Text variant="label">{label}</Text>
        {description && <Text variant="caption" color="muted" css={{ display: 'block', marginTop: spacing['2xs'] }}>{description}</Text>}
      </LabelGroup>
      <Control>{children}</Control>
    </Row>
  )
}
