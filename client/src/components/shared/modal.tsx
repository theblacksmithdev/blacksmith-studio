import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Box, Flex, Text, Button, CloseButton } from '@chakra-ui/react'

/* ── Modal ── */

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  width?: string
  footer?: ReactNode
  headerExtra?: ReactNode
}

function Modal({ title, children, onClose, width = '480px', footer, headerExtra }: ModalProps) {
  return createPortal(
    <Flex
      align="center"
      justify="center"
      css={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'var(--studio-backdrop)',
        backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <Flex
        direction="column"
        css={{
          width,
          maxHeight: '85vh',
          background: 'var(--studio-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid var(--studio-glass-border)',
          boxShadow: 'var(--studio-shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          gap={3}
          css={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--studio-border)',
            flexShrink: 0,
          }}
        >
          {headerExtra}
          <Text
            css={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--studio-text-primary)',
              flex: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Text>
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

        {/* Body */}
        <Box
          css={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {children}
        </Box>

        {/* Footer */}
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
    </Flex>,
    document.body,
  )
}

/* ── Buttons ── */

function PrimaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      {...props}
      css={{
        padding: '8px 20px',
        borderRadius: '10px',
        background: 'var(--studio-accent)',
        color: 'var(--studio-accent-fg)',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        '&:hover': { opacity: 0.85 },
        '&:disabled': { opacity: 0.5, cursor: 'default' },
      }}
    >
      {children}
    </Button>
  )
}

function SecondaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      css={{
        padding: '8px 20px',
        borderRadius: '10px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-main)',
        color: 'var(--studio-text-secondary)',
        fontSize: '14px',
        fontWeight: 500,
        '&:hover': {
          background: 'var(--studio-bg-surface)',
          borderColor: 'var(--studio-border-hover)',
          color: 'var(--studio-text-primary)',
        },
      }}
    >
      {children}
    </Button>
  )
}

function GhostButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      {...props}
      css={{
        padding: '8px 16px',
        borderRadius: '10px',
        color: 'var(--studio-text-secondary)',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        '&:hover': {
          background: 'var(--studio-bg-hover)',
          color: 'var(--studio-text-primary)',
        },
      }}
    >
      {children}
    </Button>
  )
}

function DangerButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      {...props}
      css={{
        padding: '8px 20px',
        borderRadius: '10px',
        background: 'var(--studio-error)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        '&:hover': { opacity: 0.9 },
        '&:disabled': { opacity: 0.5, cursor: 'default' },
      }}
    >
      {children}
    </Button>
  )
}

function FooterSpacer() {
  return <Flex flex={1} />
}

export {
  Modal,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  FooterSpacer,
}
