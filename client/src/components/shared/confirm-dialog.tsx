import { VStack, Text, Box } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import { Modal, DangerButton, GhostButton, FooterSpacer } from './modal'

interface ConfirmDialogProps {
  title?: string
  message: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({
  title = 'Are you sure?',
  message,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      width="400px"
      footer={
        <>
          <FooterSpacer />
          <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
          <DangerButton onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmLabel}
          </DangerButton>
        </>
      }
    >
      <VStack gap={3} align="center" css={{ padding: '8px 0', textAlign: 'center' }}>
        <Box
          css={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--studio-error-subtle))',
            border: '1px solid var(--studio-error-subtle))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--studio-error)',
          }}
        >
          <AlertTriangle size={20} />
        </Box>
        <Text css={{ fontSize: '15px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
          {message}
        </Text>
        {description && (
          <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5, maxWidth: '320px' }}>
            {description}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
