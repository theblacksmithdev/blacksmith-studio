import { Flex, Box, type FlexProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { spacing, radii } from '../tokens'
import { Text } from '../typography'

interface EmptyStateProps extends Omit<FlexProps, 'title'> {
  icon?: ReactNode
  title?: string
  description?: string
  /** Compact mode for smaller containers */
  compact?: boolean
}

export function EmptyState({
  icon,
  title,
  description,
  compact = false,
  css: cssProp,
  children,
  ...rest
}: EmptyStateProps) {
  const merged: SystemStyleObject = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: compact ? spacing.md : spacing.lg,
    padding: compact ? `${spacing['2xl']} ${spacing.lg}` : `${spacing['4xl']} ${spacing['2xl']}`,
    textAlign: 'center',
    ...(cssProp as SystemStyleObject ?? {}),
  }

  const iconStyles: SystemStyleObject = {
    width: compact ? '48px' : '64px',
    height: compact ? '48px' : '64px',
    borderRadius: compact ? radii.xl : radii['2xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--studio-bg-surface)',
    border: '1px solid var(--studio-border)',
    color: 'var(--studio-text-muted)',
    marginBottom: compact ? spacing.xs : spacing.sm,
    '& svg': {
      width: compact ? '22px' : '28px',
      height: compact ? '22px' : '28px',
    },
  }

  return (
    <Flex css={merged} {...rest}>
      {icon && (
        <Box css={iconStyles}>{icon}</Box>
      )}
      {title && (
        <Text variant={compact ? 'subtitle' : 'title'}>{title}</Text>
      )}
      {description && (
        <Text
          variant="body"
          color="muted"
          css={{
            maxWidth: compact ? '240px' : '320px',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Text>
      )}
      {children}
    </Flex>
  )
}
