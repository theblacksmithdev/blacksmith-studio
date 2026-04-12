import { useState } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { GitBranch, GitCommitHorizontal, RefreshCw, History } from 'lucide-react'
import { useGitChangedFiles, useGitHistory, useGitStatus, useGit } from '@/hooks/use-git'
import { useGitStore, selectBranchLabel } from '@/stores/git-store'
import { Text, Badge, Button, IconButton, Tooltip, EmptyState, spacing, radii } from '@/components/shared/ui'
import { SplitPanel } from '@/components/shared/layout'
import { ChangedFilesList } from './changed-files'
import { DiffViewer } from './diff-viewer'
import { CommitDialog } from './save-dialog'
import { HistoryTimeline } from './history-timeline'
import { BranchSwitcher } from './version-switcher'
import { SyncButton } from './sync-button'
import { CommitDetailDrawer } from './commit-detail'

export function SourceControlView() {
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

  // Not a git repo — show init state
  if (status.data && !status.data.initialized) {
    return (
      <Flex css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
        <EmptyState
          icon={<History />}
          title="Initialize Git Repository"
          description="This project is not a git repository yet. Initialize one to start tracking changes, creating branches, and pushing to a remote."
        >
          <Button
            variant="primary"
            size="md"
            onClick={() => initGit.mutateAsync().then(() => invalidateAll())}
            disabled={initGit.isPending}
          >
            {initGit.isPending ? 'Initializing...' : 'Initialize Repository'}
          </Button>
        </EmptyState>
      </Flex>
    )
  }

  const handleCommitted = () => {
    setShowCommitDialog(false)
    setSelectedFile(undefined)
    invalidateAll()
  }

  return (
    <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-main)' }}>
      {/* ── Header ── */}
      <Flex
        align="center"
        justify="space-between"
        css={{
          padding: `${spacing.sm} ${spacing.lg}`,
          borderBottom: '1px solid var(--studio-border)',
          background: 'var(--studio-bg-sidebar)',
          flexShrink: 0,
        }}
      >
        <Flex align="center" gap={spacing.sm}>
          <Flex
            as="button"
            align="center"
            gap={spacing.xs}
            onClick={() => setShowBranches(true)}
            css={{
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: radii.md,
              border: '1px solid var(--studio-border)',
              background: 'var(--studio-bg-main)',
              color: 'var(--studio-text-secondary)',
              cursor: 'pointer',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.12s ease',
              '&:hover': {
                borderColor: 'var(--studio-border-hover)',
                color: 'var(--studio-text-primary)',
              },
            }}
          >
            <GitBranch size={12} />
            {branchLabel || '...'}
          </Flex>

          {changedCount > 0 && (
            <Badge variant="warning" size="sm">{changedCount} changed</Badge>
          )}
        </Flex>

        <Flex align="center" gap={spacing.xs}>
          <SyncButton />
          <Tooltip content="Refresh">
            <IconButton variant="ghost" size="sm" onClick={() => invalidateAll()} aria-label="Refresh">
              <RefreshCw />
            </IconButton>
          </Tooltip>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCommitDialog(true)}
            disabled={!changedFiles.data?.length}
          >
            <GitCommitHorizontal size={13} />
            Commit
          </Button>
        </Flex>
      </Flex>

      {/* ── Main content: vertical split (changes+diff | history) ── */}
      <Box css={{ flex: 1, minHeight: 0 }}>
        <SplitPanel
          direction="vertical"
          left={
            /* ── Top: horizontal split (files | diff) ── */
            <SplitPanel
              left={
                <Flex direction="column" css={{ height: '100%', background: 'var(--studio-bg-sidebar)' }}>
                  <Flex align="center" justify="space-between" css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}>
                    <Text variant="tiny" color="muted">Changes</Text>
                    {changedFiles.data && changedFiles.data.length > 0 && (
                      <Badge variant="default" size="sm">{changedFiles.data.length}</Badge>
                    )}
                  </Flex>
                  <Box css={{ flex: 1, overflowY: 'auto', padding: `0 ${spacing.xs} ${spacing.sm}` }}>
                    {changedFiles.isLoading ? (
                      <Flex align="center" justify="center" css={{ height: '80px' }}>
                        <Text variant="caption" color="muted">Loading...</Text>
                      </Flex>
                    ) : (
                      <ChangedFilesList
                        files={changedFiles.data ?? []}
                        selectedPath={selectedFile}
                        onSelect={setSelectedFile}
                      />
                    )}
                  </Box>
                </Flex>
              }
              defaultWidth={260}
              minWidth={180}
              maxWidth={400}
              storageKey="sourceControl.filesWidth"
            >
              <DiffViewer filePath={selectedFile} onClose={() => setSelectedFile(undefined)} />
            </SplitPanel>
          }
          defaultWidth={400}
          minWidth={200}
          maxWidth={800}
          storageKey="sourceControl.historyHeight"
        >
          {/* ── Bottom: commit history ── */}
          <Flex direction="column" css={{ height: '100%', borderTop: '1px solid var(--studio-border)' }}>
            <Flex align="center" gap={spacing.xs} css={{ padding: `${spacing.sm} ${spacing.lg}`, flexShrink: 0 }}>
              <Text variant="tiny" color="muted">Commit History</Text>
              {history.data && history.data.length > 0 && (
                <Badge variant="default" size="sm">{history.data.length}</Badge>
              )}
            </Flex>
            <Box css={{ flex: 1, overflowY: 'auto', padding: `0 ${spacing.lg} ${spacing.md}` }}>
              {history.isLoading ? (
                <Flex align="center" justify="center" css={{ height: '60px' }}>
                  <Text variant="caption" color="muted">Loading...</Text>
                </Flex>
              ) : (
                <HistoryTimeline entries={history.data ?? []} onSelect={setSelectedCommit} />
              )}
            </Box>
          </Flex>
        </SplitPanel>
      </Box>

      {/* ── Dialogs ── */}
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
    </Flex>
  )
}
