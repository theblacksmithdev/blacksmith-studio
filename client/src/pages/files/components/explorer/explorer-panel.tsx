import { useMemo, useState, useEffect, useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { RefreshCw, Search, X, FileText } from "lucide-react";
import {
  Text,
  IconButton,
  Tooltip,
  Badge,
  spacing,
  radii,
} from "@/components/shared/ui";
import { api } from "@/api";
import type { SearchResult } from "@/api/modules/files";
import { TreeNode } from "./tree-node";
import { FileLabel } from "./utils/file-label";
import { OpenInEditorButton } from "./open-in-editor-button";
import { toTreeData, filterTree } from "./utils/tree-data";
import type { FileNode } from "@/types";

interface ExplorerPanelProps {
  tree: FileNode | null;
  activeTab: string | null;
  changedFiles: Set<string>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onSelectFile: (path: string) => void;
}

export function ExplorerPanel({
  tree,
  activeTab,
  changedFiles,
  searchQuery,
  onSearchChange,
  onRefresh,
  onSelectFile,
}: ExplorerPanelProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [contentResults, setContentResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced content search (300ms, min 2 chars)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.length < 2) {
      setContentResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      api.files
        .search(projectId!, searchQuery, 15)
        .then(setContentResults)
        .catch(() => setContentResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const data = useMemo(() => {
    if (!tree) return [];
    const items = toTreeData(tree);
    return searchQuery ? filterTree(items, searchQuery) : items;
  }, [tree, searchQuery]);

  const itemCount = tree?.children?.length ?? 0;
  const modifiedCount = changedFiles.size;
  const hasContentResults =
    contentResults.length > 0 && searchQuery.length >= 2;

  return (
    <Flex
      direction="column"
      css={{
        width: "100%",
        height: "100%",
        background: "var(--studio-bg-sidebar)",
      }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        css={{ padding: `${spacing.sm} ${spacing.md}`, flexShrink: 0 }}
      >
        <Text variant="tiny" color="muted">
          Explorer
        </Text>
        <Flex align="center" gap={1}>
          <OpenInEditorButton />
          <Tooltip content="Refresh file tree">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              aria-label="Refresh"
            >
              <RefreshCw />
            </IconButton>
          </Tooltip>
        </Flex>
      </Flex>

      {/* Search */}
      <Box css={{ padding: `0 ${spacing.sm} ${spacing.sm}` }}>
        <Flex
          align="center"
          css={{
            gap: spacing.xs,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: radii.md,
            background: "var(--studio-bg-surface)",
            border: "1px solid transparent",
            transition: "border-color 0.12s ease",
            "&:focus-within": { borderColor: "var(--studio-border-hover)" },
          }}
        >
          <Search
            size={12}
            style={{ color: "var(--studio-text-muted)", flexShrink: 0 }}
          />
          <input
            type="text"
            placeholder="Search files & content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--studio-text-primary)",
              fontSize: "12px",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <Box
              as="button"
              onClick={() => onSearchChange("")}
              css={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                border: "none",
                background: "var(--studio-bg-hover)",
                color: "var(--studio-text-muted)",
                cursor: "pointer",
                flexShrink: 0,
                padding: 0,
                "&:hover": { color: "var(--studio-text-primary)" },
              }}
            >
              <X size={9} />
            </Box>
          )}
        </Flex>
      </Box>

      {/* Content search results */}
      {hasContentResults && (
        <Box css={{ borderBottom: "1px solid var(--studio-border)" }}>
          <Flex
            align="center"
            gap={1}
            css={{ padding: `0 ${spacing.md} ${spacing.xs}` }}
          >
            <FileText size={10} style={{ color: "var(--studio-text-muted)" }} />
            <Text variant="caption" color="muted">
              Content matches
            </Text>
            <Badge variant="default" size="sm" css={{ marginLeft: "auto" }}>
              {contentResults.length}
            </Badge>
          </Flex>
          <Box css={{ maxHeight: "200px", overflowY: "auto" }}>
            {contentResults.map((result) => (
              <Box
                key={result.path}
                as="button"
                onClick={() => onSelectFile(result.path)}
                css={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  padding: `${spacing.xs} ${spacing.md}`,
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.08s ease",
                  "&:hover": { background: "var(--studio-bg-surface)" },
                }}
              >
                <FileLabel
                  name={result.name}
                  isSelected={result.path === activeTab}
                  iconSize={13}
                  fontSize="12px"
                />
                {result.matches.slice(0, 2).map((m) => (
                  <Flex
                    key={m.line}
                    align="baseline"
                    gap={1}
                    css={{ paddingLeft: "19px" }}
                  >
                    <Text
                      variant="caption"
                      color="muted"
                      css={{
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                        fontSize: "10px",
                      }}
                    >
                      {m.line}
                    </Text>
                    <Text
                      variant="caption"
                      color="tertiary"
                      truncate
                      css={{ display: "block", fontSize: "11px" }}
                    >
                      {m.text}
                    </Text>
                  </Flex>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* File tree */}
      <Box css={{ flex: 1, overflowY: "auto", paddingTop: "2px" }}>
        {data.length > 0 ? (
          data.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              depth={0}
              selectedFile={activeTab}
              changedFiles={changedFiles}
              onSelectFile={onSelectFile}
              defaultOpen={!searchQuery && item.isDir}
            />
          ))
        ) : (
          <Flex align="center" justify="center" css={{ height: "100px" }}>
            <Text variant="caption" color="muted">
              {searchQuery ? "No files match" : "No files"}
            </Text>
          </Flex>
        )}
      </Box>

      {/* Footer */}
      {tree && (
        <Flex
          align="center"
          gap={2}
          css={{
            padding: `${spacing.xs} ${spacing.md}`,
            borderTop: "1px solid var(--studio-border)",
          }}
        >
          <Text variant="caption" color="muted">
            {itemCount} items
          </Text>
          {modifiedCount > 0 && (
            <Badge variant="warning" size="sm">
              {modifiedCount} modified
            </Badge>
          )}
        </Flex>
      )}
    </Flex>
  );
}
