import { memo, useCallback } from "react";
import { Box, Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Text,
  Button,
  InfiniteScrollList,
  SkeletonList,
  spacing,
  radii,
} from "@/components/shared/ui";
import { FileIcon } from "@/pages/files/components/explorer/utils/file-icon";
import type { GitChangedFile } from "@/api/types";

function statusColor(status: GitChangedFile["status"]): string {
  switch (status) {
    case "modified":
      return "var(--studio-warning)";
    case "added":
    case "untracked":
      return "var(--studio-green)";
    case "deleted":
      return "var(--studio-error)";
    default:
      return "var(--studio-text-muted)";
  }
}

function statusLetter(status: GitChangedFile["status"]): string {
  switch (status) {
    case "modified":
      return "M";
    case "added":
      return "A";
    case "deleted":
      return "D";
    case "renamed":
      return "R";
    case "untracked":
      return "U";
    default:
      return "?";
  }
}

function getFileName(path: string) {
  return path.split("/").pop() || path;
}

const Row = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 6px ${spacing.sm};
  border-radius: ${radii.md};
  cursor: pointer;
  transition: background 0.1s ease;
  &:hover {
    background: var(--studio-bg-hover);
  }
`;

const CheckBox = styled.div<{ checked: boolean }>`
  width: 15px;
  height: 15px;
  border-radius: 4px;
  border: 1.5px solid
    ${({ checked }) =>
      checked ? "var(--studio-accent)" : "var(--studio-border-hover)"};
  background: ${({ checked }) =>
    checked ? "var(--studio-accent)" : "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.1s ease;
`;

const StatusPill = styled.div<{ color: string }>`
  font-size: 10px;
  font-weight: 600;
  font-family: "SF Mono", "Fira Code", monospace;
  color: ${({ color }) => color};
  flex-shrink: 0;
  min-width: 12px;
  text-align: right;
`;

const FileRow = memo(function FileRow({
  file,
  isSelected,
  onToggle,
}: {
  file: GitChangedFile;
  isSelected: boolean;
  onToggle: (path: string) => void;
}) {
  const name = getFileName(file.path);
  const color = statusColor(file.status);

  return (
    <Row>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(file.path)}
        style={{ display: "none" }}
      />
      <CheckBox checked={isSelected}>
        {isSelected && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              d="M1.5 4.5l2 2 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </CheckBox>
      <FileIcon name={name} size={13} />
      <Text
        variant="bodySmall"
        css={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--studio-text-secondary)",
        }}
      >
        {file.path}
      </Text>
      <StatusPill color={color}>{statusLetter(file.status)}</StatusPill>
    </Row>
  );
});

interface FileListProps {
  files: GitChangedFile[];
  total: number;
  selectedCount: number;
  isAllSelected: boolean;
  isFileSelected: (path: string) => boolean;
  onToggle: (path: string) => void;
  onToggleAll: () => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function FileList({
  files,
  total,
  selectedCount,
  isAllSelected,
  isFileSelected,
  onToggle,
  onToggleAll,
  onLoadMore,
  isLoadingMore,
}: FileListProps) {
  const renderItem = useCallback(
    (file: GitChangedFile) => (
      <FileRow
        file={file}
        isSelected={isFileSelected(file.path)}
        onToggle={onToggle}
      />
    ),
    [isFileSelected, onToggle],
  );

  return (
    <Flex direction="column" gap={spacing.xs}>
      <Flex
        align="center"
        justify="space-between"
        css={{ marginBottom: spacing.xs }}
      >
        <Text variant="caption" color="muted">
          {selectedCount} of {total} selected
        </Text>
        <Button variant="ghost" size="sm" onClick={onToggleAll}>
          {isAllSelected ? "Deselect all" : "Select all"}
        </Button>
      </Flex>

      <Box
        css={{
          height: "220px",
          borderRadius: radii.md,
          border: "1px solid var(--studio-border)",
          background: "var(--studio-bg-surface)",
          overflow: "hidden",
        }}
      >
        <InfiniteScrollList
          items={files}
          estimateSize={33}
          renderItem={renderItem}
          overscan={10}
          onLoadMore={onLoadMore}
          isLoadingMore={isLoadingMore}
          loadingFooter={<SkeletonList rows={3} />}
        />
      </Box>
    </Flex>
  );
}
