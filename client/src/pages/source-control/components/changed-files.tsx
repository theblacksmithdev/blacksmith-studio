import { memo, useCallback } from "react";
import { Flex } from "@chakra-ui/react";
import styled from "@emotion/styled";
import {
  Text,
  InfiniteScrollList,
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

function getDirectory(path: string) {
  const parts = path.split("/");
  if (parts.length <= 1) return "";
  return parts.slice(0, -1).join("/") + "/";
}

const Row = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 6px ${spacing.sm};
  border-radius: ${radii.md};
  border: none;
  background: ${({ selected }) =>
    selected ? "var(--studio-bg-hover)" : "transparent"};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: background 0.1s ease;
  &:hover {
    background: var(--studio-bg-hover);
  }
`;

const StatusPill = styled.span<{ color: string }>`
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
  onSelect,
}: {
  file: GitChangedFile;
  isSelected: boolean;
  onSelect: (path: string) => void;
}) {
  const name = getFileName(file.path);
  const dir = getDirectory(file.path);

  return (
    <Row selected={isSelected} onClick={() => onSelect(file.path)}>
      <FileIcon name={name} size={13} />
      <Flex direction="column" css={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="bodySmall"
          css={{
            color: isSelected
              ? "var(--studio-text-primary)"
              : "var(--studio-text-secondary)",
          }}
        >
          {name}
        </Text>
        {dir && (
          <Text
            variant="caption"
            color="muted"
            css={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {dir}
          </Text>
        )}
      </Flex>
      <StatusPill color={statusColor(file.status)}>
        {statusLetter(file.status)}
      </StatusPill>
    </Row>
  );
});

interface Props {
  files: GitChangedFile[];
  selectedPath?: string;
  onSelect: (path: string) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function ChangedFilesList({
  files,
  selectedPath,
  onSelect,
  onLoadMore,
  isLoadingMore,
}: Props) {
  if (files.length === 0) {
    return (
      <Flex
        align="center"
        justify="center"
        css={{ padding: `${spacing["3xl"]} ${spacing.md}` }}
      >
        <Text variant="caption" color="muted">
          No uncommitted changes
        </Text>
      </Flex>
    );
  }

  const renderItem = useCallback(
    (file: GitChangedFile) => (
      <FileRow
        file={file}
        isSelected={selectedPath === file.path}
        onSelect={onSelect}
      />
    ),
    [selectedPath, onSelect],
  );

  return (
    <InfiniteScrollList
      items={files}
      estimateSize={40}
      renderItem={renderItem}
      overscan={15}
      onLoadMore={onLoadMore}
      isLoadingMore={isLoadingMore}
    />
  );
}
