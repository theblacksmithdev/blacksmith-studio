import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Flex, Box, Text, CloseButton } from '@chakra-ui/react'

type DrawerPlacement = 'bottom' | 'right'

interface DrawerProps {
  title: string
  children: ReactNode
  onClose: () => void
  /** 'bottom' slides up, 'right' slides in from right. Default: 'right' */
  placement?: DrawerPlacement
  /** Width for right placement, height for bottom. Default: '560px' / '70vh' */
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
    boxShadow: 'var(--studio-shadow-lg)',
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
    borderRadius: '16px 16px 0 0',
    boxShadow: 'var(--studio-shadow-lg)',
    overflow: 'hidden',
    animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    '@keyframes slideUp': {
      from: { transform: 'translateY(100%)' },
      to: { transform: 'translateY(0)' },
    },
  }),
}

export function Drawer({ title, children, onClose, placement = 'right', size, footer, headerExtra }: DrawerProps) {
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
              borderRadius: '2px',
              background: 'var(--studio-border-hover)',
              margin: '10px auto 0',
              flexShrink: 0,
            }}
          />
        )}

        <Flex
          align="center"
          gap={3}
          css={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--studio-border)',
            flexShrink: 0,
          }}
        >
          <Text
            css={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--studio-text-primary)',
              flex: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Text>
          {headerExtra}
          <CloseButton
            size="sm"
            onClick={onClose}
            css={{
              color: 'var(--studio-text-muted)',
              borderRadius: '6px',
              '&:hover': {
                background: 'var(--studio-bg-hover)',
                color: 'var(--studio-text-primary)',
              },
            }}
          />
        </Flex>

        <Flex flex={1} direction="column" minH={0} css={{ padding: '20px', overflow: 'hidden' }}>
          {children}
        </Flex>

        {footer && (
          <Flex
            align="center"
            gap={2}
            css={{
              padding: '14px 20px',
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
