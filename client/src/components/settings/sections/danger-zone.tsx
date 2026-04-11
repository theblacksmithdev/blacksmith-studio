import { useState } from 'react'
import { Box, Text, VStack, HStack, Input } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, AlertTriangle, FolderX, Database } from 'lucide-react'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { Path } from '@/router/paths'
import { Modal, DangerButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

type RemoveMode = 'soft' | 'hard' | null

export function DangerZone() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { remove } = useProjects()
  const activeProject = useProjectStore((s) => s.activeProject)
  const [modalMode, setModalMode] = useState<RemoveMode>(null)
  const [confirmText, setConfirmText] = useState('')
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!projectId || !modalMode) return
    setRemoving(true)
    try {
      await remove(projectId, modalMode === 'hard')
      navigate(Path.Home)
    } catch {
      setRemoving(false)
    }
  }

  const confirmed = confirmText === activeProject?.name
  const closeModal = () => { setModalMode(null); setConfirmText(''); setRemoving(false) }

  return (
    <>
      <VStack gap={5} align="stretch">
        <Box>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-error)', marginBottom: '4px' }}>
            Danger Zone
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
            Irreversible actions that affect this project.
          </Text>
        </Box>

        <VStack
          gap={0}
          align="stretch"
          css={{ borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', overflow: 'hidden' }}
        >
          <DangerRow
            title="Remove from Studio"
            description="Unlink this project from Studio. Your files on disk stay untouched. Chat history and settings will be deleted."
            buttonLabel="Remove"
            onClick={() => setModalMode('soft')}
          />
          <DangerRow
            title="Delete project entirely"
            description="Permanently delete the project folder from your disk AND remove all data from Studio. This cannot be undone."
            buttonLabel="Delete everything"
            onClick={() => setModalMode('hard')}
            destructive
          />
        </VStack>
      </VStack>

      {modalMode && (
        <Modal
          title={modalMode === 'hard' ? 'Delete project entirely' : 'Remove from Studio'}
          onClose={closeModal}
          width="440px"
          headerExtra={
            <Box css={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--studio-error-subtle)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {modalMode === 'hard'
                ? <FolderX size={14} style={{ color: 'var(--studio-error)' }} />
                : <Database size={14} style={{ color: 'var(--studio-error)' }} />}
            </Box>
          }
          footer={
            <>
              <FooterSpacer />
              <GhostButton onClick={closeModal}>Cancel</GhostButton>
              <DangerButton onClick={handleRemove} disabled={!confirmed || removing}>
                <Trash2 size={13} />
                {removing ? 'Removing...' : modalMode === 'hard' ? 'Delete everything' : 'Remove from Studio'}
              </DangerButton>
            </>
          }
        >
          <VStack gap={4} align="stretch">
            {/* Warning */}
            <Box
              css={{
                padding: '12px 14px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <HStack gap={2} css={{ marginBottom: '6px' }}>
                <AlertTriangle size={14} style={{ color: 'var(--studio-error)' }} />
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-error)' }}>
                  This action cannot be undone
                </Text>
              </HStack>
              {modalMode === 'hard' ? (
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                  This will <strong>permanently delete</strong> the folder at{' '}
                  <code style={{ fontSize: '11px', background: 'var(--studio-bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>{activeProject?.path}</code>{' '}
                  from your disk, along with all chat history and settings.
                </Text>
              ) : (
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                  Your project files will remain on disk. All chat history and settings stored in Studio will be permanently deleted.
                </Text>
              )}
            </Box>

            {/* Confirmation input */}
            <Box>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-secondary)', marginBottom: '8px' }}>
                Type <strong style={{ color: 'var(--studio-text-primary)' }}>{activeProject?.name}</strong> to confirm:
              </Text>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={activeProject?.name || ''}
                autoFocus
                css={{
                  padding: '9px 12px', borderRadius: '7px',
                  border: '1px solid var(--studio-border)', background: 'var(--studio-bg-surface)',
                  color: 'var(--studio-text-primary)', fontSize: '14px',
                  '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
                }}
              />
            </Box>
          </VStack>
        </Modal>
      )}
    </>
  )
}

function DangerRow({ title, description, buttonLabel, onClick, destructive }: {
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <HStack
      gap={4}
      css={{
        padding: '16px',
        borderBottom: '1px solid rgba(239,68,68,0.15)',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box css={{ flex: 1 }}>
        <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '4px' }}>
          {title}
        </Text>
        <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
          {description}
        </Text>
      </Box>
      <Box
        as="button"
        onClick={onClick}
        css={{
          padding: '7px 14px', borderRadius: '7px', whiteSpace: 'nowrap', flexShrink: 0,
          border: destructive ? 'none' : '1px solid var(--studio-error)',
          background: destructive ? 'var(--studio-error)' : 'transparent',
          color: destructive ? '#fff' : 'var(--studio-error)',
          fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.12s ease',
          '&:hover': destructive ? { opacity: 0.9 } : { background: 'var(--studio-error-subtle)' },
        }}
      >
        {buttonLabel}
      </Box>
    </HStack>
  )
}
