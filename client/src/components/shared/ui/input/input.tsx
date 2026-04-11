import { Input as ChakraInput, type InputProps as ChakraInputProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing, radii, shadows } from '../tokens'

export type InputSize = 'sm' | 'md'

const sizeStyles: Record<InputSize, SystemStyleObject> = {
  sm: { padding: `${spacing.xs} ${spacing.sm}`, fontSize: '12px', borderRadius: radii.md, height: 'auto' },
  md: { padding: `${spacing.sm} ${spacing.md}`, fontSize: '13px', borderRadius: radii.md, height: 'auto' },
}

interface InputProps extends Omit<ChakraInputProps, 'size'> {
  size?: InputSize
}

export function Input({
  size = 'md',
  css: cssProp,
  ...rest
}: InputProps) {
  const merged: SystemStyleObject = {
    background: 'var(--studio-bg-inset)',
    border: '1px solid var(--studio-border)',
    color: 'var(--studio-text-primary)',
    fontFamily: 'inherit',
    letterSpacing: 'inherit',
    outline: 'none',
    transition: 'all 0.12s ease',
    '&::placeholder': { color: 'var(--studio-text-muted)' },
    '&:focus': {
      borderColor: 'var(--studio-border-hover)',
      boxShadow: shadows.focus,
      outline: 'none',
    },
    '&:disabled': { opacity: 0.5, cursor: 'default' },
    ...sizeStyles[size],
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return <ChakraInput css={merged} {...rest} />
}
