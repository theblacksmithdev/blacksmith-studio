import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { Trash2, AlertTriangle, FolderX, Database } from 'lucide-react'
import styled from '@emotion/styled'
import { useProjects } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { Path } from '@/router/paths'
import { Text } from '@/components/shared/ui'
import { Modal, DangerButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

type RemoveMode = 'soft' | 'hard' | null

const DangerCard = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-error-subtle);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

const DangerRowWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--studio-error-subtle);

  &:last-child {
    border-bottom: none;
  }
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

  &:hover {
    ${(p) => (p.fill ? 'opacity: 0.9;' : 'background: var(--studio-error-subtle);')}
  }
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

  &:focus {
    border-color: var(--studio-border-hover);
  }
`

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
          <DangerRowWrap>
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
                Remove from Studio
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                Unlink this project. Files on disk stay untouched, but chat history and settings are deleted.
              </Text>
            </Box>
            <DangerBtn onClick={() => setModalMode('soft')}>Remove</DangerBtn>
          </DangerRowWrap>
          <DangerRowWrap>
            <Box css={{ flex: 1 }}>
              <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)', marginBottom: '2px' }}>
                Delete project entirely
              </Text>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                Permanently delete the project folder from disk and remove all data from Studio.
              </Text>
            </Box>
            <DangerBtn fill onClick={() => setModalMode('hard')}>Delete everything</DangerBtn>
          </DangerRowWrap>
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
              <FooterSpacer />
              <GhostButton onClick={closeModal}>Cancel</GhostButton>
              <DangerButton onClick={handleRemove} disabled={!confirmed || removing}>
                <Trash2 size={13} />
                {removing ? 'Removing...' : modalMode === 'hard' ? 'Delete everything' : 'Remove'}
              </DangerButton>
            </>
          }
        >
          <Flex direction="column" gap="16px">
            <Flex direction="column" gap="6px" css={{
              padding: '12px 14px', borderRadius: '8px',
              background: 'var(--studio-error-subtle)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <Flex align="center" gap="6px">
                <AlertTriangle size={14} style={{ color: 'var(--studio-error)' }} />
                <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-error)' }}>
                  This action cannot be undone
                </Text>
              </Flex>
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
                {modalMode === 'hard'
                  ? <>This will permanently delete the folder at <code style={{ fontSize: '12px', background: 'var(--studio-bg-surface)', padding: '1px 4px', borderRadius: '3px' }}>{activeProject?.path}</code> from your disk, along with all chat history and settings.</>
                  : 'Your project files will remain on disk. All chat history and settings stored in Studio will be permanently deleted.'}
              </Text>
            </Flex>

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
