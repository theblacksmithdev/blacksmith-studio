import { Tooltip as ChakraTooltip } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { spacing, radii, shadows } from '../tokens'

interface TooltipProps {
  content: string
  children: ReactNode
  /** Placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, placement }: TooltipProps) {
  return (
    <ChakraTooltip.Root positioning={placement ? { placement } : undefined}>
      <ChakraTooltip.Trigger asChild>
        {children}
      </ChakraTooltip.Trigger>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content
          css={{
            background: 'var(--studio-bg-hover-strong)',
            color: 'var(--studio-text-primary)',
            fontSize: '12px',
            fontWeight: 500,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: radii.md,
            border: '1px solid var(--studio-border)',
            boxShadow: shadows.sm,
            letterSpacing: '-0.003em',
          }}
        >
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  )
}
