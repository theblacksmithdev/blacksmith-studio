import type { ReactNode } from 'react'
import { Dialog, Button, Flex, CloseButton } from '@chakra-ui/react'

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
  return (
    <Dialog.Root open onOpenChange={() => {}} closeOnInteractOutside={false}>
      <Dialog.Backdrop
        css={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(6px)',
        }}
      />
      <Dialog.Positioner>
        <Dialog.Content
          css={{
            width,
            maxHeight: '85vh',
            background: 'var(--studio-bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--studio-border)',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Dialog.Header
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 20px',
              borderBottom: '1px solid var(--studio-border)',
            }}
          >
            <Dialog.Title
              css={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--studio-text-primary)',
                flex: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </Dialog.Title>
            {headerExtra}
            <Dialog.CloseTrigger asChild>
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
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body
            css={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
            }}
          >
            {children}
          </Dialog.Body>

          {footer && (
            <Dialog.Footer
              css={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 20px',
                borderTop: '1px solid var(--studio-border)',
              }}
            >
              {footer}
            </Dialog.Footer>
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
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
        fontSize: '13px',
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
        fontSize: '13px',
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
        fontSize: '13px',
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
        fontSize: '13px',
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
