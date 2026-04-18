import { useCallback, useRef, useEffect, useState } from "react";
import { Tree } from "react-arborist";
import type { NodeApi, TreeApi } from "react-arborist";
import { Box } from "@chakra-ui/react";
import { NodeRow } from "./node-row";
import { useLazyTree } from "./hooks/use-lazy-tree";
import type { TreeItem } from "../utils/tree-data";
import type { FileNode } from "@/types";

interface FileTreeProps {
  root: FileNode | null;
  activeFile: string | null;
  changedFiles: Set<string>;
  searchQuery: string;
  onSelectFile: (path: string) => void;
}

/**
 * Virtualised + lazily-loaded file tree.
 *
 * - `react-arborist` renders only the rows in the viewport.
 * - The root + its direct children are fetched up front. Any folder the
 *   user opens fires `useFileChildren` to pull its direct children on
 *   demand, so we never walk the whole project.
 */
export function FileTree({
  root,
  activeFile,
  changedFiles,
  searchQuery,
  onSelectFile,
}: FileTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<TreeApi<TreeItem> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { data, ensureLoaded } = useLazyTree(root);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const api = treeRef.current;
    if (!api) return;
    if (activeFile) api.select(activeFile, { align: "smart" });
    else api.deselectAll();
  }, [activeFile]);

  const searchMatch = useCallback(
    (node: NodeApi<TreeItem>, term: string) =>
      node.data.name.toLowerCase().includes(term.toLowerCase()),
    [],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const node = treeRef.current?.get(id);
      if (!node) return;
      if (!node.isOpen) return; // only fetch on open
      ensureLoaded(node.data.path, node.data.isDir);
    },
    [ensureLoaded],
  );

  return (
    <Box
      ref={containerRef}
      css={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <Tree<TreeItem>
          ref={(api) => {
            treeRef.current = api ?? null;
          }}
          data={data}
          width={size.width}
          height={size.height}
          rowHeight={28}
          indent={14}
          paddingTop={2}
          paddingBottom={8}
          openByDefault={false}
          searchTerm={searchQuery || undefined}
          searchMatch={searchMatch}
          onToggle={handleToggle}
          disableMultiSelection
          selection={activeFile ?? undefined}
        >
          {(nodeProps) => (
            <NodeRow
              {...nodeProps}
              changedFiles={changedFiles}
              onSelectFile={onSelectFile}
            />
          )}
        </Tree>
      )}
    </Box>
  );
}
