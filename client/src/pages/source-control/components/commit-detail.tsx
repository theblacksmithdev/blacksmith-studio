import { useState, useMemo, memo, useCallback } from "react";
import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { GitCommitHorizontal, User, Calendar, Copy, Check } from "lucide-react";
import { useGitCommitDetailQuery } from "@/api/hooks/git";
import {
  Drawer,
  Text,
  Badge,
  InfiniteScrollList,
  spacing,
  radii,
} from "@/components/shared/ui";
import { FileIcon } from "@/pages/files/components/explorer/utils/file-icon";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classifyLine(line: string): "add" | "remove" | "hunk" | "context" {
  if (line.startsWith("@@")) return "hunk";
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "remove";
  return "context";
}

const diffBg: Record<string, string> = {
  add: "var(--studio-green-subtle)",
  remove: "var(--studio-error-subtle)",
  hunk: "var(--studio-bg-surface)",
  context: "transparent",
};
const diffText: Record<string, string> = {
  add: "var(--studio-text-primary)",
  remove: "var(--studio-text-primary)",
  hunk: "var(--studio-text-muted)",
  context: "var(--studio-text-tertiary)",
};

function getFileName(path: string) {
  return path.split("/").pop() || path;
}

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  color: var(--studio-text-muted);
`;

const HashBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: ${radii.md};
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition: all 0.12s ease;
  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  margin-bottom: ${spacing.sm};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: 5px ${spacing.sm};
  border-radius: ${radii.md};
  transition: background 0.1s ease;
  &:hover {
    background: var(--studio-bg-hover);
  }
`;

interface Props {
  hash: string;
  onClose: () => void;
}

export function CommitDetailDrawer({ hash, onClose }: Props) {
  const { data: detail, isLoading } = useGitCommitDetailQuery(hash);
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { totalAdded, totalDeleted, diffLines } = useMemo(() => {
    if (!detail) return { totalAdded: 0, totalDeleted: 0, diffLines: [] as string[] };
    return {
      totalAdded: detail.files.reduce((n, f) => n + f.insertions, 0),
      totalDeleted: detail.files.reduce((n, f) => n + f.deletions, 0),
      diffLines: detail.diff
        .split("\n")
        .filter(
          (l) =>
            !l.startsWith("diff --git") &&
            !l.startsWith("index ") &&
            !l.startsWith("---") &&
            !l.startsWith("+++"),
        ),
    };
  }, [detail]);

  const renderDiffLine = useCallback((line: string, i: number) => {
    const type = classifyLine(line);
    return (
      <Flex
        css={{
          background: diffBg[type],
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: "12px",
          lineHeight: "18px",
        }}
      >
        <Box
          css={{
            width: "36px",
            minWidth: "36px",
            padding: "0 6px",
            textAlign: "right",
            color: "var(--studio-text-muted)",
            fontSize: "11px",
            userSelect: "none",
            opacity: 0.4,
          }}
        >
          {i + 1}
        </Box>
        <Box
          css={{
            flex: 1,
            padding: "0 10px 0 6px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            color: diffText[type],
            fontWeight: type === "hunk" ? 600 : 400,
          }}
        >
          {line || " "}
        </Box>
      </Flex>
    );
  }, []);

  return (
    <Drawer
      title={detail?.message ?? "Commit"}
      subtitle={detail ? `${detail.hash.slice(0, 7)} · ${detail.author}` : undefined}
      onClose={onClose}
      size="lg"
      headerExtra={
        <GitCommitHorizontal size={15} style={{ color: "var(--studio-text-muted)" }} />
      }
    >
      {isLoading ? (
        <Flex align="center" justify="center" css={{ height: "200px" }}>
          <Text variant="caption" color="muted">Loading…</Text>
        </Flex>
      ) : detail ? (
        <Flex direction="column" gap={spacing.xl} css={{ height: "100%", minHeight: 0 }}>

          {/* ── Metadata ── */}
          <Flex align="center" gap={spacing.md} css={{ flexWrap: "wrap" }}>
            <HashBtn onClick={copyHash}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {detail.hash.slice(0, 7)}
            </HashBtn>
            <Meta>
              <User size={12} />
              <Text variant="caption">{detail.author}</Text>
            </Meta>
            <Meta>
              <Calendar size={12} />
              <Text variant="caption">{formatDate(detail.date)}</Text>
            </Meta>
          </Flex>

          {/* ── Files changed ── */}
          <Box>
            <Flex align="center" gap={spacing.sm} css={{ marginBottom: spacing.sm }}>
              <SectionLabel style={{ marginBottom: 0 }}>Files changed</SectionLabel>
              <Badge variant="default" size="sm">{detail.files.length}</Badge>
              {totalAdded > 0 && (
                <Text variant="caption" css={{ color: "var(--studio-green)", fontWeight: 500 }}>
                  +{totalAdded}
                </Text>
              )}
              {totalDeleted > 0 && (
                <Text variant="caption" css={{ color: "var(--studio-error)", fontWeight: 500 }}>
                  −{totalDeleted}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1px">
              {detail.files.map((f) => (
                <FileItem key={f.path}>
                  <FileIcon name={getFileName(f.path)} size={13} />
                  <Text
                    variant="bodySmall"
                    css={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.path}
                  </Text>
                  {f.insertions > 0 && (
                    <Text variant="caption" css={{ color: "var(--studio-green)", fontWeight: 500 }}>
                      +{f.insertions}
                    </Text>
                  )}
                  {f.deletions > 0 && (
                    <Text variant="caption" css={{ color: "var(--studio-error)", fontWeight: 500 }}>
                      −{f.deletions}
                    </Text>
                  )}
                </FileItem>
              ))}
            </Flex>
          </Box>

          {/* ── Diff ── */}
          <Box css={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <SectionLabel>Diff</SectionLabel>
            <Box
              css={{
                flex: 1,
                minHeight: 0,
                borderRadius: radii.lg,
                border: "1px solid var(--studio-border)",
                background: "var(--studio-bg-sidebar)",
                overflow: "hidden",
              }}
            >
              <InfiniteScrollList
                items={diffLines}
                estimateSize={18}
                overscan={40}
                renderItem={renderDiffLine}
              />
            </Box>
          </Box>
        </Flex>
      ) : (
        <Flex align="center" justify="center" css={{ height: "200px" }}>
          <Text variant="caption" color="muted">Failed to load commit</Text>
        </Flex>
      )}
    </Drawer>
  );
}
