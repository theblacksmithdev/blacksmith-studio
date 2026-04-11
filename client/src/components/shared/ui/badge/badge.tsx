import { Box, type BoxProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing, radii } from '../tokens'

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'outline'
export type BadgeSize = 'sm' | 'md'

const sizeStyles: Record<BadgeSize, SystemStyleObject> = {
  sm: { padding: `${spacing['2xs']} ${spacing.xs}`, fontSize: '10px', borderRadius: radii.xs },
  md: { padding: `${spacing['2xs']} ${spacing.sm}`, fontSize: '11px', borderRadius: radii.sm },
}

const variantStyles: Record<BadgeVariant, SystemStyleObject> = {
  default: {
    background: 'var(--studio-bg-surface)',
    color: 'var(--studio-text-secondary)',
    border: '1px solid var(--studio-border)',
  },
  success: {
    background: 'var(--studio-green-subtle)',
    color: 'var(--studio-green)',
    border: '1px solid var(--studio-green-border)',
  },
  error: {
    background: 'var(--studio-error-subtle)',
    color: 'var(--studio-error)',
    border: '1px solid transparent',
  },
  warning: {
    background: 'rgba(245,124,0,0.08)',
    color: 'var(--studio-warning)',
    border: '1px solid transparent',
  },
  info: {
    background: 'var(--studio-blue-subtle)',
    color: 'var(--studio-link)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'transparent',
    color: 'var(--studio-text-tertiary)',
    border: '1px solid var(--studio-border)',
  },
}

interface BadgeProps extends Omit<BoxProps, 'variant'> {
  variant?: BadgeVariant
  size?: BadgeSize
}

export function Badge({
  variant = 'default',
  size = 'sm',
  css: cssProp,
  children,
  ...rest
}: BadgeProps) {
  const merged: SystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    lineHeight: 1.4,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <Box as="span" css={merged} {...rest}>
      {children}
    </Box>
  )
}
