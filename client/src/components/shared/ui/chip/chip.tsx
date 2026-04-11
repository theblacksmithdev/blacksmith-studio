import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing, radii } from '../tokens'

export type ChipVariant = 'default' | 'active' | 'success'

const variantStyles: Record<ChipVariant, SystemStyleObject> = {
  default: {
    background: 'var(--studio-bg-main)',
    color: 'var(--studio-text-secondary)',
    border: '1px solid var(--studio-border)',
    '&:hover': {
      borderColor: 'var(--studio-border-hover)',
      color: 'var(--studio-text-primary)',
      background: 'var(--studio-bg-surface)',
    },
  },
  active: {
    background: 'var(--studio-bg-hover)',
    color: 'var(--studio-text-primary)',
    border: '1px solid var(--studio-border-hover)',
  },
  success: {
    background: 'var(--studio-green-subtle)',
    color: 'var(--studio-green)',
    border: '1px solid var(--studio-green-border)',
  },
}

interface ChipProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: ChipVariant
}

export function Chip({
  variant = 'default',
  css: cssProp,
  children,
  ...rest
}: ChipProps) {
  const merged: SystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: radii.full,
    fontSize: '12px',
    fontWeight: 450,
    fontFamily: 'inherit',
    letterSpacing: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    height: 'auto',
    ...variantStyles[variant],
    '&:active': { transform: 'scale(0.97)' },
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <ChakraButton css={merged} {...rest}>
      {children}
    </ChakraButton>
  )
}
