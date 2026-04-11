import { Flex, Box, type FlexProps } from '@chakra-ui/react'
import type { SystemStyleObject } from '@chakra-ui/react'
import { spacing } from '../tokens'

export type ToolbarVariant = 'top' | 'bottom' | 'inline'

const variantStyles: Record<ToolbarVariant, SystemStyleObject> = {
  top: {
    borderBottom: '1px solid var(--studio-border)',
    background: 'var(--studio-bg-sidebar)',
  },
  bottom: {
    borderTop: '1px solid var(--studio-border)',
    background: 'var(--studio-bg-sidebar)',
  },
  inline: {
    background: 'transparent',
  },
}

interface ToolbarProps extends Omit<FlexProps, 'variant'> {
  variant?: ToolbarVariant
}

export function Toolbar({
  variant = 'top',
  css: cssProp,
  children,
  ...rest
}: ToolbarProps) {
  const merged: SystemStyleObject = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.lg}`,
    flexShrink: 0,
    minHeight: '40px',
    ...variantStyles[variant],
    ...(cssProp as SystemStyleObject ?? {}),
  }

  return (
    <Flex css={merged} {...rest}>
      {children}
    </Flex>
  )
}

/** Vertical divider inside a toolbar */
export function ToolbarDivider() {
  return (
    <Box
      css={{
        width: '1px',
        height: spacing.lg,
        background: 'var(--studio-border)',
        flexShrink: 0,
      }}
    />
  )
}

/** Spacer that pushes subsequent items to the right */
export function ToolbarSpacer() {
  return <Box css={{ flex: 1 }} />
}
