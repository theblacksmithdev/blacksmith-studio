import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, Input } from '@chakra-ui/react'
import { GitBranch, Plus, GitMerge } from 'lucide-react'
import { useGitBranches, useGit } from '@/hooks/use-git'
import { Modal, PrimaryButton, SecondaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'

const BranchRow = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: ${(p) => (p.active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: var(--studio-text-primary);
  font-size: 13px;
  cursor: ${(p) => (p.active ? 'default' : 'pointer')};
  text-align: left;
  width: 100%;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const CurrentDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--studio-accent);
  flex-shrink: 0;
`

const InactiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--studio-border-hover);
  flex-shrink: 0;
`

const BranchName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
`

const SubLabel = styled.span`
  font-size: 11px;
  color: var(--studio-text-muted);
  flex-shrink: 0;
`

const CreateRow = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--studio-border);
  margin-top: 8px;
`

const MergeBar = styled.div`
  padding: 14px 20px;
  border-top: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
`

const inputCss = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--studio-border)',
  background: 'var(--studio-bg-inset)',
  fontSize: '13px',
  color: 'var(--studio-text-primary)',
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
}

interface Props {
  onClose: () => void
}

export function BranchSwitcher({ onClose }: Props) {
  const { data: branches, isLoading } = useGitBranches()
  const { createBranch, switchBranch, merge, invalidateAll } = useGit()
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [mergeSource, setMergeSource] = useState<string | null>(null)

  const current = branches?.find((b) => b.current)
  const others = branches?.filter((b) => !b.current) ?? []

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createBranch.mutateAsync({ name: newName.trim() })
    setNewName('')
    setShowCreate(false)
    invalidateAll()
  }

  const handleCheckout = async (name: string) => {
    await switchBranch.mutateAsync({ name })
    invalidateAll()
  }

  const handleMerge = async (source: string) => {
    if (!current) return
    const result = await merge.mutateAsync({ source, target: current.name })
    if (!result.success) {
      alert(`Merge conflicts in: ${result.conflicts.join(', ')}`)
    }
    setMergeSource(null)
    invalidateAll()
  }

  return (
    <Modal
      title="Branches"
      onClose={onClose}
      width="420px"
      headerExtra={<GitBranch size={16} style={{ color: 'var(--studio-text-muted)' }} />}
    >
      {isLoading ? (
        <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '12px' }}>Loading...</Text>
      ) : (
        <Flex direction="column" gap={1}>
          {/* Current branch */}
          {current && (
            <BranchRow active>
              <CurrentDot />
              <BranchName>{current.name}</BranchName>
              <SubLabel>current</SubLabel>
            </BranchRow>
          )}

          {/* Other branches */}
          {others.map((b) => (
            <BranchRow key={b.name} onClick={() => handleCheckout(b.name)}>
              <InactiveDot />
              <BranchName>{b.name}</BranchName>
              <GhostButton
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); setMergeSource(b.name) }}
                css={{ padding: '2px 8px', fontSize: '11px' }}
              >
                Merge
              </GhostButton>
            </BranchRow>
          ))}

          {/* Create */}
          {showCreate ? (
            <CreateRow>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="branch-name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                css={inputCss}
              />
              <PrimaryButton
                onClick={handleCreate}
                disabled={!newName.trim() || createBranch.isPending}
              >
                Create
              </PrimaryButton>
            </CreateRow>
          ) : (
            <GhostButton
              onClick={() => setShowCreate(true)}
              css={{
                width: '100%',
                marginTop: '8px',
                border: '1px dashed var(--studio-border)',
                '&:hover': { borderColor: 'var(--studio-border-hover)' },
              }}
            >
              <Plus size={13} />
              <Box as="span" css={{ marginLeft: '4px' }}>New branch</Box>
            </GhostButton>
          )}
        </Flex>
      )}

      {/* Merge confirmation */}
      {mergeSource && current && (
        <MergeBar>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
            Merge <strong style={{ color: 'var(--studio-text-primary)' }}>{mergeSource}</strong> into <strong style={{ color: 'var(--studio-text-primary)' }}>{current.name}</strong>?
          </Text>
          <Flex gap={2}>
            <FooterSpacer />
            <SecondaryButton onClick={() => setMergeSource(null)}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={() => handleMerge(mergeSource)}
              disabled={merge.isPending}
            >
              <GitMerge size={12} />
              <Box as="span" css={{ marginLeft: '4px' }}>
                {merge.isPending ? 'Merging...' : 'Merge'}
              </Box>
            </PrimaryButton>
          </Flex>
        </MergeBar>
      )}
    </Modal>
  )
}
