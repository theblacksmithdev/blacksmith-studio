import { Flex, Box, type FlexProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { spacing, radii } from '../tokens'
import { Text } from '../typography'

interface ListItemProps extends Omit<FlexProps, 'title' | 'left' | 'right'> {
  /** Left element — icon, avatar, or any ReactNode */
  left?: ReactNode
  /** Right element — badge, status dot, action button */
  right?: ReactNode
  /** Primary text */
  title: string
  /** Secondary text below title */
  subtitle?: string
  /** Whether this item is currently selected */
  active?: boolean
  /** Click handler */
  onClick?: () => void
}

export function ListItem({
  left,
  right,
  title,
  subtitle,
  active = false,
  onClick,
  css: cssProp,
  ...rest
}: ListItemProps) {
  const merged: SystemStyleObject = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radii.lg,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.12s ease',
    background: active ? 'var(--studio-bg-hover)' : 'transparent',
    '&:hover': onClick ? {
      background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    } : {},
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <Flex css={merged} onClick={onClick} {...rest}>
      {left}
      <Box css={{ flex: 1, minWidth: 0 }}>
        <Text variant="label" truncate css={{ display: 'block', color: active ? 'var(--studio-text-primary)' : undefined }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="muted" truncate css={{ display: 'block', marginTop: spacing['2xs'] }}>
            {subtitle}
          </Text>
        )}
      </Box>
      {right}
    </Flex>
  )
}
