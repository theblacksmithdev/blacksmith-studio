import { useMemo, memo, useCallback } from "react";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Text, InfiniteScrollList, spacing } from "@/components/shared/ui";
import type { GitCommitEntry } from "@/api/types";

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString();
}

function getDateKey(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString(undefined, { weekday: "long" });
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type FlatItem =
  | { type: "header"; label: string }
  | { type: "entry"; entry: GitCommitEntry };

function flattenWithHeaders(entries: GitCommitEntry[]): FlatItem[] {
  const items: FlatItem[] = [];
  let lastKey = "";
  for (const entry of entries) {
    const key = getDateKey(entry.date);
    if (key !== lastKey) {
      items.push({ type: "header", label: key });
      lastKey = key;
    }
    items.push({ type: "entry", entry });
  }
  return items;
}

const CommitBtn = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: calc(100% - 5px);
  margin-left: 5px;
  padding: 7px ${spacing.sm};
  border: none;
  border-left: 1px solid var(--studio-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s ease;

  &:hover {
    border-left-color: var(--studio-text-muted);
    background: var(--studio-bg-surface);
  }
  &:hover .commit-dot {
    background: var(--studio-text-muted);
  }
`;

const CommitDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--studio-border-hover);
  flex-shrink: 0;
  margin-left: -4px;
  transition: background 0.1s ease;
`;

const HashLabel = styled.span`
  font-size: 11px;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  opacity: 0.6;
  letter-spacing: 0.02em;
`;

const CommitRow = memo(function CommitRow({
  entry,
  onSelect,
}: {
  entry: GitCommitEntry;
  onSelect?: (hash: string) => void;
}) {
  return (
    <CommitBtn onClick={() => onSelect?.(entry.hash)}>
      <CommitDot className="commit-dot" />
      <HashLabel>{entry.hash.slice(0, 7)}</HashLabel>
      <Text
        variant="bodySmall"
        css={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--studio-text-primary)",
          fontWeight: 450,
        }}
      >
        {entry.message}
      </Text>
      <Text
        variant="caption"
        color="muted"
        css={{ flexShrink: 0, fontSize: "11px" }}
      >
        {formatRelative(entry.date)}
      </Text>
    </CommitBtn>
  );
});

interface Props {
  entries: GitCommitEntry[];
  onSelect?: (hash: string) => void;
}

export function HistoryTimeline({ entries, onSelect }: Props) {
  const flatItems = useMemo(() => flattenWithHeaders(entries), [entries]);

  if (entries.length === 0) {
    return (
      <Flex
        align="center"
        justify="center"
        css={{ padding: `${spacing.xl} 0` }}
      >
        <Text variant="caption" color="muted">
          No commits yet
        </Text>
      </Flex>
    );
  }

  const renderItem = useCallback(
    (item: FlatItem) => {
      if (item.type === "header") {
        return (
          <Box css={{ padding: `${spacing.sm} 0 ${spacing.xs} 1px` }}>
            <Text
              variant="tiny"
              color="muted"
              css={{ textTransform: "uppercase", letterSpacing: "0.07em" }}
            >
              {item.label}
            </Text>
          </Box>
        );
      }
      return <CommitRow entry={item.entry} onSelect={onSelect} />;
    },
    [onSelect],
  );

  return (
    <InfiniteScrollList
      items={flatItems}
      estimateSize={32}
      renderItem={renderItem}
      overscan={20}
    />
  );
}
