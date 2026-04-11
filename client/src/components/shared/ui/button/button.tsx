import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing, radii } from '../tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const sizeStyles: Record<ButtonSize, SystemStyleObject> = {
  sm: { padding: `${spacing.xs} ${spacing.md}`, fontSize: '12px', borderRadius: radii.md, height: 'auto' },
  md: { padding: `${spacing.sm} ${spacing.xl}`, fontSize: '13px', borderRadius: radii.lg, height: 'auto' },
  lg: { padding: `${spacing.sm} ${spacing['2xl']}`, fontSize: '14px', borderRadius: radii.lg, height: 'auto' },
}

const variantStyles: Record<ButtonVariant, SystemStyleObject> = {
  primary: {
    background: 'var(--studio-accent)',
    color: 'var(--studio-accent-fg)',
    border: 'none',
    fontWeight: 500,
    '&:hover': { opacity: 0.85 },
    '&:active': { opacity: 0.75 },
    '&:disabled': { opacity: 0.4, cursor: 'default', pointerEvents: 'none' },
  },
  secondary: {
    background: 'var(--studio-bg-main)',
    color: 'var(--studio-text-secondary)',
    border: '1px solid var(--studio-border)',
    fontWeight: 500,
    '&:hover': {
      background: 'var(--studio-bg-surface)',
      borderColor: 'var(--studio-border-hover)',
      color: 'var(--studio-text-primary)',
    },
    '&:active': { background: 'var(--studio-bg-hover)' },
    '&:disabled': { opacity: 0.4, cursor: 'default', pointerEvents: 'none' },
  },
  ghost: {
    background: 'transparent',
    color: 'var(--studio-text-secondary)',
    border: 'none',
    fontWeight: 500,
    '&:hover': {
      background: 'var(--studio-bg-hover)',
      color: 'var(--studio-text-primary)',
    },
    '&:active': { background: 'var(--studio-bg-hover-strong)' },
    '&:disabled': { opacity: 0.4, cursor: 'default', pointerEvents: 'none' },
  },
  danger: {
    background: 'var(--studio-error)',
    color: '#ffffff',
    border: 'none',
    fontWeight: 500,
    '&:hover': { opacity: 0.9 },
    '&:active': { opacity: 0.8 },
    '&:disabled': { opacity: 0.4, cursor: 'default', pointerEvents: 'none' },
  },
}

interface ButtonProps extends Omit<ChakraButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  css: cssProp,
  children,
  ...rest
}: ButtonProps) {
  const merged: SystemStyleObject = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    letterSpacing: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <ChakraButton css={merged} {...rest}>
      {children}
    </ChakraButton>
  )
}
