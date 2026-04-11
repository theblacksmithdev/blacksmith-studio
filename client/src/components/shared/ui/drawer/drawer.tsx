import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Flex, Box } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { spacing, radii, shadows } from '../tokens'
import { Text } from '../typography'
import { IconButton } from '../icon-button'

export type DrawerPlacement = 'bottom' | 'right'

interface DrawerProps {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  placement?: DrawerPlacement
  size?: string
  footer?: ReactNode
  headerExtra?: ReactNode
}

const panelStyles: Record<DrawerPlacement, (size: string) => Record<string, any>> = {
  right: (size) => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 501,
    width: size,
    maxWidth: '90vw',
    background: 'var(--studio-glass)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderLeft: '1px solid var(--studio-glass-border)',
    boxShadow: shadows.lg,
    overflow: 'hidden',
    animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    '@keyframes slideInRight': {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
  }),
  bottom: (size) => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 501,
    height: size,
    maxHeight: '90vh',
    background: 'var(--studio-glass)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--studio-glass-border)',
    borderRadius: `${radii['3xl']} ${radii['3xl']} 0 0`,
    boxShadow: shadows.lg,
    overflow: 'hidden',
    animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    '@keyframes slideUp': {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
  }),
}

export function Drawer({ title, subtitle, children, onClose, placement = 'right', size, footer, headerExtra }: DrawerProps) {
  const defaultSize = placement === 'right' ? '560px' : '70vh'
  const resolvedSize = size || defaultSize

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return createPortal(
    <>
      <Box
        onClick={onClose}
        css={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          background: 'var(--studio-backdrop)',
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      <Flex direction="column" css={panelStyles[placement](resolvedSize)}>
        {placement === 'bottom' && (
          <Box
            css={{
              width: '36px',
              height: '4px',
              borderRadius: radii.xs,
              background: 'var(--studio-border-hover)',
              margin: `${spacing.sm} auto 0`,
              flexShrink: 0,
            }}
          />
        )}

        <Flex
          align="center"
          gap={3}
          css={{
            padding: `${spacing.md} ${spacing.xl}`,
            borderBottom: '1px solid var(--studio-border)',
            flexShrink: 0,
          }}
        >
          <Box css={{ flex: 1 }}>
            <Text variant="subtitle">{title}</Text>
            {subtitle && <Text variant="caption" color="muted">{subtitle}</Text>}
          </Box>
          {headerExtra}
          <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X />
          </IconButton>
        </Flex>

        <Flex flex={1} direction="column" minH={0} css={{ padding: spacing.xl, overflow: 'hidden' }}>
          {children}
        </Flex>

        {footer && (
          <Flex
            align="center"
            gap={2}
            css={{
              padding: `${spacing.md} ${spacing.xl}`,
              borderTop: '1px solid var(--studio-border)',
              flexShrink: 0,
            }}
          >
            {footer}
          </Flex>
        )}
      </Flex>
    </>,
    document.body,
  )
}
