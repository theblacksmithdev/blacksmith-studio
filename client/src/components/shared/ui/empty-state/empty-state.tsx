import { Flex, type FlexProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { spacing } from '../tokens'
import { Text } from '../typography'
import { Avatar } from '../avatar'

interface EmptyStateProps extends Omit<FlexProps, 'title'> {
  icon?: ReactNode
  title?: string
  description?: string
}

export function EmptyState({
  icon,
  title,
  description,
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
    gap: spacing.sm,
    padding: `${spacing['3xl']} ${spacing.xl}`,
    textAlign: 'center',
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <Flex css={merged} {...rest}>
      {icon && (
        <Avatar size="lg" variant="active" icon={icon} />
      )}
      {title && (
        <Text variant="subtitle">{title}</Text>
      )}
      {description && (
        <Text variant="bodySmall" color="muted" css={{ maxWidth: '280px', lineHeight: 1.6 }}>
          {description}
        </Text>
      )}
      {children}
    </Flex>
  )
}
