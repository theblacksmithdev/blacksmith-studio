import { memo, useCallback } from "react";
import { Box, Flex, Checkbox } from "@chakra-ui/react";
import {
  Text,
  Badge,
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

  return (
    <Flex
      as="label"
      align="center"
      gap={spacing.sm}
      css={{
        padding: `5px ${spacing.sm}`,
        borderRadius: radii.md,
        cursor: "pointer",
        transition: "background 0.1s ease",
        "&:hover": { background: "var(--studio-bg-hover)" },
      }}
    >
      <Checkbox.Root
        checked={isSelected}
        onCheckedChange={() => onToggle(file.path)}
        size="sm"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control
          css={{
            borderRadius: "4px",
            border: "1px solid var(--studio-border)",
            "&[data-state=checked]": {
              background: "var(--studio-accent)",
              borderColor: "var(--studio-accent)",
            },
          }}
        >
          <Checkbox.Indicator>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M2 5l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </Checkbox.Indicator>
        </Checkbox.Control>
      </Checkbox.Root>

      <FileIcon name={name} size={14} />
      <Text
        variant="bodySmall"
        css={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {file.path}
      </Text>
      <Box
        css={{
          fontSize: "10px",
          fontWeight: 600,
          fontFamily: "'SF Mono', monospace",
          color: statusColor(file.status),
        }}
      >
        {statusLetter(file.status)}
      </Box>
    </Flex>
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
    <Flex direction="column" gap={spacing.sm}>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={spacing.xs}>
          <Text
            variant="bodySmall"
            css={{ fontWeight: 500, color: "var(--studio-text-secondary)" }}
          >
            Files
          </Text>
          <Badge variant="default" size="sm">
            {selectedCount}/{total}
          </Badge>
        </Flex>
        <Button variant="ghost" size="sm" onClick={onToggleAll}>
          {isAllSelected ? "Deselect all" : "Select all"}
        </Button>
      </Flex>

      <Box
        css={{
          height: "240px",
          borderRadius: radii.md,
          border: "1px solid var(--studio-border)",
          overflow: "hidden",
        }}
      >
        <InfiniteScrollList
          items={files}
          estimateSize={32}
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
