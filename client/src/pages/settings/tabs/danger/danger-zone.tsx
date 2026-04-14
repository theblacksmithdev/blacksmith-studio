import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle, FolderX, Database } from 'lucide-react'
import styled from '@emotion/styled'
import { useProjectQuery, useRemoveProject } from '@/api/hooks/projects'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { Path } from '@/router/paths'
import { Text, Modal, ModalDangerButton, ModalFooterSpacer, Button, Alert } from '@/components/shared/ui'

type RemoveMode = 'soft' | 'hard' | null

const DangerCard = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-error-subtle);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

const DangerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-error-subtle);
  &:last-child { border-bottom: none; }
`

const DangerBtn = styled.button<{ fill?: boolean }>`
  padding: 7px 14px;
  border-radius: 7px;
  white-space: nowrap;
  flex-shrink: 0;
  border: ${(p) => (p.fill ? 'none' : '1px solid var(--studio-error)')};
  background: ${(p) => (p.fill ? 'var(--studio-error)' : 'transparent')};
  color: ${(p) => (p.fill ? '#fff' : 'var(--studio-error)')};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover { ${(p) => (p.fill ? 'opacity: 0.9;' : 'background: var(--studio-error-subtle);')} }
`

const ConfirmInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;
  &:focus { border-color: var(--studio-border-hover); box-shadow: var(--studio-ring-focus); }
`

export function DangerZone() {
  const navigate = useNavigate()
  const projectId = useActiveProjectId()
  const { data: activeProject } = useProjectQuery(projectId)
  const removeMutation = useRemoveProject()
  const [modalMode, setModalMode] = useState<RemoveMode>(null)
  const [confirmText, setConfirmText] = useState('')
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!projectId || !modalMode) return
    setRemoving(true)
    try {
      await removeMutation.mutateAsync({ id: projectId!, hard: modalMode === 'hard' })
      navigate(Path.Home)
    } catch {
      setRemoving(false)
    }
  }

  const confirmed = confirmText === activeProject?.name
  const closeModal = () => { setModalMode(null); setConfirmText(''); setRemoving(false) }

  return (
    <>
      <Flex direction="column" gap="14px">
        <Box>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-error)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Danger Zone
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
            Irreversible actions that affect this project.
          </Text>
        </Box>

        <DangerCard>
          <DangerRow>
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
                Remove from Studio
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                Unlink this project. Files on disk stay untouched, but chat history and settings are deleted.
              </Text>
            </Box>
            <DangerBtn onClick={() => setModalMode('soft')}>Remove</DangerBtn>
          </DangerRow>
          <DangerRow>
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
                Delete project entirely
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                Permanently delete the project folder from disk and remove all data from Studio.
              </Text>
            </Box>
            <DangerBtn fill onClick={() => setModalMode('hard')}>Delete everything</DangerBtn>
          </DangerRow>
        </DangerCard>
      </Flex>

      {modalMode && (
        <Modal
          title={modalMode === 'hard' ? 'Delete project entirely' : 'Remove from Studio'}
          onClose={closeModal}
          width="440px"
          headerExtra={
            <Flex css={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--studio-error-subtle)',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {modalMode === 'hard'
                ? <FolderX size={14} style={{ color: 'var(--studio-error)' }} />
                : <Database size={14} style={{ color: 'var(--studio-error)' }} />}
            </Flex>
          }
          footer={
            <>
              <ModalFooterSpacer />
              <Button variant="ghost" size="md" onClick={closeModal}>Cancel</Button>
              <ModalDangerButton onClick={handleRemove} disabled={!confirmed || removing}>
                <Trash2 size={13} />
                {removing ? 'Removing...' : modalMode === 'hard' ? 'Delete everything' : 'Remove'}
              </ModalDangerButton>
            </>
          }
        >
          <Flex direction="column" gap="16px">
            <Alert variant="error" icon={<AlertTriangle size={14} />}>
              <Flex direction="column" gap="4px">
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-error)' }}>
                  This action cannot be undone
                </Text>
                <Text css={{ fontSize: '12px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                  {modalMode === 'hard'
                    ? <>Permanently deletes <code style={{ fontSize: '11px', background: 'var(--studio-bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>{activeProject?.path}</code> from disk, along with all chat history and settings.</>
                    : 'Your project files remain on disk. All chat history and settings in Studio will be permanently deleted.'}
                </Text>
              </Flex>
            </Alert>

            <Box>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-secondary)', marginBottom: '8px' }}>
                Type <strong style={{ color: 'var(--studio-text-primary)' }}>{activeProject?.name}</strong> to confirm:
              </Text>
              <ConfirmInput
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={activeProject?.name || ''}
                autoFocus
              />
            </Box>
          </Flex>
        </Modal>
      )}
    </>
  )
}
