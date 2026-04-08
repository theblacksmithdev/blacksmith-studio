import { useState } from 'react'
import styled from '@emotion/styled'
import { Box, Flex, Text } from '@chakra-ui/react'
import { GitCommitHorizontal, GitBranch, RefreshCw, History } from 'lucide-react'
import { useGitChangedFiles, useGitHistory, useGitStatus, useGit } from '@/hooks/use-git'
import { useGitStore, selectBranchLabel } from '@/stores/git-store'
import { EmptyState } from '@/components/shared/empty-state'
import { PrimaryButton, SecondaryButton } from '@/components/shared/modal'
import { ChangedFilesList } from './changed-files'
import { DiffViewer } from './diff-viewer'
import { CommitDialog } from './save-dialog'
import { HistoryTimeline } from './history-timeline'
import { BranchSwitcher } from './version-switcher'
import { SyncButton } from './sync-button'
import { CommitDetailDrawer } from './commit-detail'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--studio-bg-main);
  animation: fadeIn 0.15s ease;
`

const TopBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`

const ChangesSection = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
`

const FilesPanel = styled.div`
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const FilesPanelHeader = styled.div`
  flex-shrink: 0;
  padding: 14px 16px 10px;
`

const FilesPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
`

const DiffPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-width: 0;
`

const HistorySection = styled.div`
  flex-shrink: 0;
  max-height: 38%;
  overflow-y: auto;
  border-top: 1px solid var(--studio-border);
  padding: 14px 20px 20px;
`

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 10px;
`

const BranchBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  background: var(--studio-bg-main);
  border: 1px solid var(--studio-border);
  font-size: 12px;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
    color: var(--studio-text-primary);
  }
`

const ChangedBadge = styled.span`
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--studio-bg-surface);
  color: var(--studio-text-muted);
`

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
    border-color: var(--studio-border-hover);
  }
`

const InitRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: var(--studio-bg-main);
  animation: fadeIn 0.15s ease;
`

export function CheckpointsView() {
  const [selectedFile, setSelectedFile] = useState<string>()
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [showBranches, setShowBranches] = useState(false)
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)

  const status = useGitStatus()
  const changedFiles = useGitChangedFiles()
  const history = useGitHistory()
  const { initGit, invalidateAll } = useGit()

  const branchLabel = useGitStore(selectBranchLabel)
  const changedCount = useGitStore((s) => s.changedCount)

  // Not a git repo
  if (status.data && !status.data.initialized) {
    return (
      <InitRoot>
        <EmptyState
          icon={<History size={28} />}
          title="Initialize Git Repository"
          description="This project is not a git repository yet. Initialize one to start tracking changes, creating branches, and pushing to a remote."
          action={
            <PrimaryButton
              onClick={() => initGit.mutateAsync().then(() => invalidateAll())}
              disabled={initGit.isPending}
            >
              {initGit.isPending ? 'Initializing...' : 'Initialize Repository'}
            </PrimaryButton>
          }
        />
      </InitRoot>
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
          <Text css={{ fontSize: '14px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
            Source Control
          </Text>
          <BranchBadge onClick={() => setShowBranches(true)}>
            <GitBranch size={12} />
            {branchLabel || '...'}
          </BranchBadge>
          {changedCount > 0 && (
            <ChangedBadge>{changedCount} changed</ChangedBadge>
          )}
        </Flex>

        <Flex align="center" gap={2}>
          <SyncButton />
          <IconBtn onClick={() => invalidateAll()} title="Refresh">
            <RefreshCw size={13} />
          </IconBtn>
          <PrimaryButton
            onClick={() => setShowCommitDialog(true)}
            disabled={!changedFiles.data?.length}
          >
            <GitCommitHorizontal size={13} />
            <Box as="span" css={{ marginLeft: '6px' }}>Commit</Box>
          </PrimaryButton>
        </Flex>
      </TopBar>

      <MainContent>
        <ChangesSection>
          <FilesPanel>
            <FilesPanelHeader>
              <SectionLabel>Changes</SectionLabel>
            </FilesPanelHeader>
            <FilesPanelBody>
              {changedFiles.isLoading ? (
                <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '8px' }}>Loading...</Text>
              ) : (
                <ChangedFilesList
                  files={changedFiles.data ?? []}
                  selectedPath={selectedFile}
                  onSelect={setSelectedFile}
                />
              )}
            </FilesPanelBody>
          </FilesPanel>
          <DiffPanel>
            <DiffViewer filePath={selectedFile} />
          </DiffPanel>
        </ChangesSection>

        <HistorySection>
          <SectionLabel>Commit History</SectionLabel>
          {history.isLoading ? (
            <Text css={{ fontSize: '13px', color: 'var(--studio-text-muted)', padding: '8px' }}>Loading...</Text>
          ) : (
            <HistoryTimeline entries={history.data ?? []} onSelect={setSelectedCommit} />
          )}
        </HistorySection>
      </MainContent>

      {showCommitDialog && changedFiles.data && (
        <CommitDialog
          files={changedFiles.data}
          onClose={() => setShowCommitDialog(false)}
          onCommitted={handleCommitted}
        />
      )}

      {showBranches && (
        <BranchSwitcher onClose={() => setShowBranches(false)} />
      )}

      {selectedCommit && (
        <CommitDetailDrawer hash={selectedCommit} onClose={() => setSelectedCommit(null)} />
      )}
    </Root>
  )
}
