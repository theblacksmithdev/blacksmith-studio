import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text, Button } from '@chakra-ui/react'
import { GitCommitHorizontal, History as HistoryIcon, GitBranch, RefreshCw } from 'lucide-react'
import { useGitChangedFiles, useGitHistory, useGitStatus, useGit } from '@/hooks/use-git'
import { useGitStore, selectBranchLabel } from '@/stores/git-store'
import { ChangedFilesList } from './changed-files'
import { DiffViewer } from './diff-viewer'
import { CommitDialog } from './save-dialog'
import { HistoryTimeline } from './history-timeline'
import { BranchSwitcher } from './version-switcher'
import { SyncButton } from './sync-button'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-main);
`

const TopBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--studio-border);
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ChangesSection = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
`

const FilesPanel = styled.div`
  width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--studio-border);
  overflow-y: auto;
  padding: 12px;
`

const DiffPanel = styled.div`
  flex: 1;
  display: flex;
  padding: 12px;
  min-width: 0;
`

const HistorySection = styled.div`
  flex-shrink: 0;
  max-height: 40%;
  overflow-y: auto;
  border-top: 1px solid var(--studio-border);
  padding: 12px 24px 24px;
`

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--studio-text-muted);
  padding: 8px 0 4px;
`

const BranchBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-secondary);
`

const InitPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  text-align: center;
  padding: 40px;
`

export function CheckpointsView() {
  const [selectedFile, setSelectedFile] = useState<string>()
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [showBranches, setShowBranches] = useState(false)

  const status = useGitStatus()
  const changedFiles = useGitChangedFiles()
  const history = useGitHistory()
  const { initGit, invalidateAll } = useGit()

  const branchLabel = useGitStore(selectBranchLabel)
  const changedCount = useGitStore((s) => s.changedCount)

  // Not a git repo — show init prompt
  if (status.data && !status.data.initialized) {
    return (
      <Root>
        <InitPrompt>
          <Box css={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--studio-text-muted)',
          }}>
            <HistoryIcon size={26} />
          </Box>
          <Box>
            <Text css={{ fontSize: '18px', fontWeight: 600, color: 'var(--studio-text-primary)', marginBottom: '6px' }}>
              Initialize Git Repository
            </Text>
            <Text css={{ fontSize: '14px', color: 'var(--studio-text-tertiary)', maxWidth: '380px', lineHeight: 1.5 }}>
              This project is not a git repository yet. Initialize one to start tracking changes, creating branches, and pushing to a remote.
            </Text>
          </Box>
          <Button
            size="sm"
            onClick={() => initGit.mutateAsync().then(() => invalidateAll())}
            disabled={initGit.isPending}
            css={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: 'var(--studio-accent)',
              color: 'var(--studio-accent-fg)',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              '&:hover': { opacity: 0.85 },
            }}
          >
            {initGit.isPending ? 'Initializing...' : 'Initialize Repository'}
          </Button>
        </InitPrompt>
      </Root>
    )
  }

  const handleCommitted = () => {
    setShowCommitDialog(false)
    setSelectedFile(undefined)
    invalidateAll()
  }

  return (
    <Root>
      <TopBar>
        <Flex align="center" gap={3}>
          <Text css={{ fontSize: '16px', fontWeight: 600, color: 'var(--studio-text-primary)' }}>
            Source Control
          </Text>
          <BranchBadge
            as="button"
            onClick={() => setShowBranches(true)}
            style={{ cursor: 'pointer' }}
          >
            <GitBranch size={12} />
            {branchLabel || 'Loading...'}
          </BranchBadge>
          {changedCount > 0 && (
            <Text css={{
              fontSize: '12px', color: 'var(--studio-text-muted)',
              background: 'var(--studio-bg-surface)',
              padding: '2px 8px',
              borderRadius: '10px',
            }}>
              {changedCount} changed
            </Text>
          )}
        </Flex>

        <Flex gap={2}>
          <SyncButton />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => invalidateAll()}
            css={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--studio-border)',
              background: 'transparent',
              color: 'var(--studio-text-muted)',
              fontSize: '12px',
              '&:hover': { background: 'var(--studio-bg-hover)', color: 'var(--studio-text-secondary)' },
            }}
          >
            <RefreshCw size={13} />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCommitDialog(true)}
            disabled={!changedFiles.data?.length}
            css={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'var(--studio-accent)',
              color: 'var(--studio-accent-fg)',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              '&:hover': { opacity: 0.85 },
              '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
            }}
          >
            <GitCommitHorizontal size={13} />
            <span style={{ marginLeft: '6px' }}>Commit</span>
          </Button>
        </Flex>
      </TopBar>

      <MainContent>
        {/* Changes */}
        <ChangesSection>
          <FilesPanel>
            <SectionTitle>Changes</SectionTitle>
            {changedFiles.isLoading ? (
              <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '12px' }}>Loading...</Text>
            ) : (
              <ChangedFilesList
                files={changedFiles.data ?? []}
                selectedPath={selectedFile}
                onSelect={setSelectedFile}
              />
            )}
          </FilesPanel>
          <DiffPanel>
            <DiffViewer filePath={selectedFile} />
          </DiffPanel>
        </ChangesSection>

        {/* Commit History */}
        <HistorySection>
          <SectionTitle>Commit History</SectionTitle>
          {history.isLoading ? (
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '12px' }}>Loading...</Text>
          ) : (
            <HistoryTimeline entries={history.data ?? []} />
          )}
        </HistorySection>
      </MainContent>

      {/* Commit dialog */}
      {showCommitDialog && changedFiles.data && (
        <CommitDialog
          files={changedFiles.data}
          onClose={() => setShowCommitDialog(false)}
          onCommitted={handleCommitted}
        />
      )}

      {/* Branch switcher */}
      {showBranches && (
        <BranchSwitcher onClose={() => setShowBranches(false)} />
      )}
    </Root>
  )
}
