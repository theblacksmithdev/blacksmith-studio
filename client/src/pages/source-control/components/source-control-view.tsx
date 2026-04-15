import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  GitBranch,
  GitCommitHorizontal,
  RefreshCw,
  History,
} from "lucide-react";
import {
  useGitChangedFilesQuery,
  useGitHistoryQuery,
  useGitStatusQuery,
  useGitInit,
  useInvalidateGit,
} from "@/api/hooks/git";
import { useGitStore, selectBranchLabel } from "@/stores/git-store";
import {
  Text,
  Badge,
  Button,
  IconButton,
  Tooltip,
  EmptyState,
  spacing,
  radii,
} from "@/components/shared/ui";
import { SplitPanel } from "@/components/shared/layout";
import { ChangedFilesList } from "./changed-files";
import { DiffViewer } from "./diff-viewer";
import { CommitDialog } from "./commit-dialog";
import { HistoryTimeline } from "./history-timeline";
import { BranchSwitcher } from "./branch-switcher";
import { SyncButton } from "./sync-button";
import { CommitDetailDrawer } from "./commit-detail";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.sm} ${spacing.lg};
  border-bottom: 1px solid var(--studio-border);
  background: var(--studio-bg-sidebar);
  flex-shrink: 0;
  gap: ${spacing.sm};
`;

const BranchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px ${spacing.sm};
  border-radius: ${radii.md};
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  cursor: pointer;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.12s ease;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

const PanelLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.sm} ${spacing.md};
  flex-shrink: 0;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: var(--studio-border);
`;

export function SourceControlView() {
  const [selectedFile, setSelectedFile] = useState<string>();
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  const status = useGitStatusQuery();
  const changedFiles = useGitChangedFilesQuery();
  const history = useGitHistoryQuery();
  const initGit = useGitInit();
  const invalidateAll = useInvalidateGit();

  const branchLabel = useGitStore(selectBranchLabel);
  const changedCount = useGitStore((s) => s.changedCount);

  // Not a git repo — show init state
  if (status.data && !status.data.initialized) {
    return (
      <Flex css={{ height: "100%", background: "var(--studio-bg-main)" }}>
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
            {initGit.isPending ? "Initializing…" : "Initialize Repository"}
          </Button>
        </EmptyState>
      </Flex>
    );
  }

  const handleCommitted = () => {
    setShowCommitDialog(false);
    setSelectedFile(undefined);
    invalidateAll();
  };

  return (
    <Flex direction="column" css={{ height: "100%", background: "var(--studio-bg-main)" }}>

      {/* ── Header ── */}
      <Header>
        <Flex align="center" gap={spacing.sm} css={{ minWidth: 0 }}>
          <Tooltip content="Switch branch">
            <BranchButton onClick={() => setShowBranches(true)}>
              <GitBranch size={12} style={{ flexShrink: 0 }} />
              {branchLabel || "…"}
            </BranchButton>
          </Tooltip>
          {changedCount > 0 && (
            <Badge variant="warning" size="sm">{changedCount}</Badge>
          )}
        </Flex>

        <Flex align="center" gap={spacing.xs} css={{ flexShrink: 0 }}>
          <SyncButton />
          <Tooltip content="Refresh">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={invalidateAll}
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </IconButton>
          </Tooltip>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCommitDialog(true)}
            disabled={changedFiles.total === 0}
          >
            <GitCommitHorizontal size={13} />
            Commit
          </Button>
        </Flex>
      </Header>

      {/* ── Body ── */}
      <Box css={{ flex: 1, minHeight: 0 }}>
        <SplitPanel
          direction="vertical"
          defaultWidth={420}
          minWidth={220}
          maxWidth={900}
          storageKey="sourceControl.historyHeight"
          left={
            /* Top half: files | diff */
            <SplitPanel
              defaultWidth={240}
              minWidth={160}
              maxWidth={400}
              storageKey="sourceControl.filesWidth"
              left={
                <Flex
                  direction="column"
                  css={{ height: "100%", background: "var(--studio-bg-sidebar)" }}
                >
                  <PanelLabel>
                    <Text variant="tiny" color="muted">Changes</Text>
                    {changedFiles.total > 0 && (
                      <Badge variant="default" size="sm">{changedFiles.total}</Badge>
                    )}
                  </PanelLabel>
                  <Box css={{ flex: 1, minHeight: 0, padding: `0 ${spacing.xs} ${spacing.sm}` }}>
                    {changedFiles.isLoading ? (
                      <Flex align="center" justify="center" css={{ height: "80px" }}>
                        <Text variant="caption" color="muted">Loading…</Text>
                      </Flex>
                    ) : (
                      <ChangedFilesList
                        files={changedFiles.data}
                        selectedPath={selectedFile}
                        onSelect={setSelectedFile}
                        onLoadMore={changedFiles.hasNextPage ? () => changedFiles.fetchNextPage() : undefined}
                        isLoadingMore={changedFiles.isFetchingNextPage}
                      />
                    )}
                  </Box>
                </Flex>
              }
            >
              <DiffViewer
                filePath={selectedFile}
                onClose={() => setSelectedFile(undefined)}
              />
            </SplitPanel>
          }
        >
          {/* Bottom: commit history */}
          <Flex
            direction="column"
            css={{ height: "100%", borderTop: "1px solid var(--studio-border)" }}
          >
            <PanelLabel>
              <Flex align="center" gap={spacing.xs}>
                <Text variant="tiny" color="muted">History</Text>
                {history.data && history.data.length > 0 && (
                  <Badge variant="default" size="sm">{history.data.length}</Badge>
                )}
              </Flex>
            </PanelLabel>
            <SectionDivider />
            <Box css={{ flex: 1, overflowY: "auto", padding: `${spacing.sm} ${spacing.lg} ${spacing.md}` }}>
              {history.isLoading ? (
                <Flex align="center" justify="center" css={{ height: "60px" }}>
                  <Text variant="caption" color="muted">Loading…</Text>
                </Flex>
              ) : (
                <HistoryTimeline
                  entries={history.data ?? []}
                  onSelect={setSelectedCommit}
                />
              )}
            </Box>
          </Flex>
        </SplitPanel>
      </Box>

      {/* ── Dialogs ── */}
      {showCommitDialog && (
        <CommitDialog
          onClose={() => setShowCommitDialog(false)}
          onCommitted={handleCommitted}
        />
      )}
      {showBranches && (
        <BranchSwitcher onClose={() => setShowBranches(false)} />
      )}
      {selectedCommit && (
        <CommitDetailDrawer
          hash={selectedCommit}
          onClose={() => setSelectedCommit(null)}
        />
      )}
    </Flex>
  );
}
