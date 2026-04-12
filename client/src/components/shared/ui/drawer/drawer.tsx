import { useEffect, type ReactNode } from 'react'
import { Drawer as ChakraDrawer, Portal } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { spacing } from '../tokens'
import { Text } from '../typography'
import { IconButton } from '../icon-button'

export type DrawerPlacement = 'bottom' | 'end' | 'start'
export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface DrawerProps {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
  placement?: DrawerPlacement
  size?: DrawerSize
  footer?: ReactNode
  headerExtra?: ReactNode
  headerTrailing?: ReactNode
}

export function Drawer({
  title,
  subtitle,
  children,
  onClose,
  placement = 'end',
  size,
  footer,
  headerExtra,
  headerTrailing,
}: DrawerProps) {
  // Cleanup on unmount — Chakra may not clean up if the component is
  // conditionally unmounted (e.g. {show && <Drawer />}) without transitioning open → false
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.body.style.pointerEvents = ''
      document.body.removeAttribute('data-scroll-locked')
    }
  }, [])

  return (
    <ChakraDrawer.Root
      open
      onOpenChange={(e) => { if (!e.open) onClose() }}
      placement={placement}
      size={size}
      trapFocus={false}
    >
      <Portal>
        <ChakraDrawer.Backdrop
          css={{
            background: 'var(--studio-backdrop)',
            backdropFilter: 'blur(12px)',
          }}
        />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content
            css={{
              background: 'var(--studio-glass)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: 'var(--studio-glass-border)',
            }}
          >
            <ChakraDrawer.Header css={{ gap: spacing.sm, borderBottom: '1px solid var(--studio-border)' }}>
              {headerExtra}
              <div style={{ flex: 1, minWidth: 0 }}>
                <ChakraDrawer.Title asChild>
                  <Text variant="subtitle" css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                  </Text>
                </ChakraDrawer.Title>
                {subtitle && (
                  <ChakraDrawer.Description asChild>
                    <Text variant="caption" color="muted">{subtitle}</Text>
                  </ChakraDrawer.Description>
                )}
              </div>
              {headerTrailing}
              <ChakraDrawer.CloseTrigger asChild>
                <IconButton variant="ghost" size="sm" aria-label="Close" css={{ position: 'static' }}>
                  <X />
                </IconButton>
              </ChakraDrawer.CloseTrigger>
            </ChakraDrawer.Header>

            <ChakraDrawer.Body css={{ padding: spacing.xl }}>
              {children}
            </ChakraDrawer.Body>

            {footer && (
              <ChakraDrawer.Footer css={{ borderTop: '1px solid var(--studio-border)' }}>
                {footer}
              </ChakraDrawer.Footer>
            )}
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  )
}
