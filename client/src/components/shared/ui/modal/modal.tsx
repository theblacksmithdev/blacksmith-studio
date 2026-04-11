import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Flex, Box } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { spacing, radii, shadows } from '../tokens'
import { Text } from '../typography'
import { Button } from '../button'
import { IconButton } from '../icon-button'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  width?: string
  footer?: ReactNode
  headerExtra?: ReactNode
}

export function Modal({ title, children, onClose, width = '480px', footer, headerExtra }: ModalProps) {
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
          borderRadius: radii['3xl'],
          border: '1px solid var(--studio-glass-border)',
          boxShadow: shadows.lg,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          gap={3}
          css={{
            padding: `${spacing.lg} ${spacing.xl}`,
            borderBottom: '1px solid var(--studio-border)',
            flexShrink: 0,
          }}
        >
          {headerExtra}
          <Text variant="subtitle" css={{ flex: 1 }}>{title}</Text>
          <IconButton variant="ghost" size="sm" onClick={onClose} aria-label="Close">
            <X />
          </IconButton>
        </Flex>

        {/* Body */}
        <Box css={{ flex: 1, overflowY: 'auto', padding: spacing.xl }}>
          {children}
        </Box>

        {/* Footer */}
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
    </Flex>,
    document.body,
  )
}

/* Re-export Button variants as modal-specific helpers for convenience */
export function ModalPrimaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="primary" size="md" {...props}>{children}</Button>
}

export function ModalSecondaryButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="secondary" size="md" {...props}>{children}</Button>
}

export function ModalDangerButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return <Button variant="danger" size="md" {...props}>{children}</Button>
}

export function ModalFooterSpacer() {
  return <Flex flex={1} />
}
