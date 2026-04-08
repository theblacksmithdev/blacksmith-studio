import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, Button, Input } from '@chakra-ui/react'
import { GitBranch, Plus, X, GitMerge } from 'lucide-react'
import { useGitBranches, useGit } from '@/hooks/use-git'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const Panel = styled.div`
  width: 400px;
  max-height: 70vh;
  background: var(--studio-bg-main);
  border-radius: 16px;
  border: 1px solid var(--studio-border);
  box-shadow: var(--studio-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--studio-border);
`

const Body = styled.div`
  padding: 16px 24px;
  flex: 1;
  overflow-y: auto;
`

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
  transition: background 0.1s ease;

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
  border: 1.5px solid var(--studio-border);
  flex-shrink: 0;
`

const BranchName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', monospace;
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

const MergeSection = styled.div`
  padding: 16px 24px;
  border-top: 1px solid var(--studio-border);
`

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
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Flex align="center" gap={2}>
            <GitBranch size={16} style={{ color: 'var(--studio-text-muted)' }} />
            <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
              Branches
            </Text>
          </Flex>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            css={{
              color: 'var(--studio-text-muted)',
              borderRadius: '8px',
              padding: '4px',
              '&:hover': { background: 'var(--studio-bg-hover)' },
            }}
          >
            <X size={16} />
          </Button>
        </Header>

        <Body>
          {isLoading ? (
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '12px' }}>Loading...</Text>
          ) : (
            <>
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
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setMergeSource(b.name) }}
                    css={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: 'var(--studio-text-muted)',
                      '&:hover': { color: 'var(--studio-text-secondary)', background: 'var(--studio-bg-surface)' },
                    }}
                  >
                    Merge
                  </Button>
                </BranchRow>
              ))}

              {/* Create new branch */}
              {showCreate ? (
                <CreateRow>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="branch-name"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    css={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--studio-border)',
                      background: 'var(--studio-bg-sidebar)',
                      fontSize: '13px',
                      color: 'var(--studio-text-primary)',
                      fontFamily: "'SF Mono', monospace",
                      '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={!newName.trim() || createBranch.isPending}
                    css={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'var(--studio-accent)',
                      color: 'var(--studio-accent-fg)',
                      fontSize: '12px',
                      border: 'none',
                      '&:hover': { opacity: 0.85 },
                      '&:disabled': { opacity: 0.4 },
                    }}
                  >
                    Create
                  </Button>
                </CreateRow>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCreate(true)}
                  css={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px dashed var(--studio-border)',
                    background: 'transparent',
                    color: 'var(--studio-text-muted)',
                    fontSize: '13px',
                    '&:hover': { borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-secondary)' },
                  }}
                >
                  <Plus size={13} />
                  <span style={{ marginLeft: '6px' }}>New branch</span>
                </Button>
              )}
            </>
          )}
        </Body>

        {/* Merge confirmation */}
        {mergeSource && current && (
          <MergeSection>
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-secondary)', marginBottom: '12px' }}>
              Merge <strong>{mergeSource}</strong> into <strong>{current.name}</strong>?
            </Text>
            <Flex gap={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMergeSource(null)}
                css={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--studio-border)',
                  fontSize: '12px',
                  color: 'var(--studio-text-secondary)',
                  '&:hover': { background: 'var(--studio-bg-hover)' },
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleMerge(mergeSource)}
                disabled={merge.isPending}
                css={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'var(--studio-accent)',
                  color: 'var(--studio-accent-fg)',
                  fontSize: '12px',
                  border: 'none',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                <GitMerge size={12} />
                <span style={{ marginLeft: '4px' }}>
                  {merge.isPending ? 'Merging...' : 'Merge'}
                </span>
              </Button>
            </Flex>
          </MergeSection>
        )}
      </Panel>
    </Overlay>
  )
}
