import { Flex, type FlexProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { sizes, radii } from '../tokens'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg'
export type AvatarVariant = 'default' | 'active' | 'user'

const sizeMap: Record<AvatarSize, { dim: string; radius: string; iconSize: string }> = {
  xs: { dim: sizes.icon.xs, radius: radii.xs, iconSize: '10px' },
  sm: { dim: '26px', radius: radii.sm, iconSize: '12px' },
  md: { dim: sizes.icon.md, radius: radii.md, iconSize: '16px' },
  lg: { dim: sizes.icon.lg, radius: radii['2xl'], iconSize: '22px' },
}

const variantStyles: Record<AvatarVariant, SystemStyleObject> = {
  default: {
    background: 'var(--studio-bg-surface)',
    border: '1px solid var(--studio-border)',
    color: 'var(--studio-text-tertiary)',
  },
  active: {
    background: 'linear-gradient(135deg, var(--studio-green-subtle), var(--studio-green-subtle))',
    border: '1px solid var(--studio-green-border)',
    color: 'var(--studio-green)',
  },
  user: {
    background: 'var(--studio-accent)',
    border: 'none',
    color: 'var(--studio-accent-fg)',
  },
}

interface AvatarProps extends Omit<FlexProps, 'variant'> {
  size?: AvatarSize
  variant?: AvatarVariant
  icon?: ReactNode
}

export function Avatar({
  size = 'sm',
  variant = 'default',
  icon,
  css: cssProp,
  children,
  ...rest
}: AvatarProps) {
  const s = sizeMap[size]

  const merged: SystemStyleObject = {
    width: s.dim,
    height: s.dim,
    borderRadius: s.radius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
    '& svg': { width: s.iconSize, height: s.iconSize },
    ...variantStyles[variant],
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <Flex css={merged} {...rest}>
      {icon ?? children}
    </Flex>
  )
}
