import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFileChildren } from "@/api/hooks/files";
import type { FileNode } from "@/types";
import { toTreeData, type TreeItem } from "../../utils/tree-data";

/**
 * Owns the lazily-loaded tree data for the explorer.
 *
 * The server returns the root + its direct children on mount. Every time
 * the user opens a folder we haven't fetched yet, `loadChildren` fetches
 * its direct children via React Query and splices them in. Folders that
 * have been fetched are cached in a Set so we don't refetch on re-open.
 */
export function useLazyTree(root: FileNode | null) {
  const [data, setData] = useState<TreeItem[]>(() =>
    root ? toTreeData(root) : [],
  );
  const loaded = useRef<Set<string>>(new Set());
  const inFlight = useRef<Set<string>>(new Set());
  const mutation = useFileChildren();

  // Reset state when the root changes (project switch / refresh).
  useEffect(() => {
    setData(root ? toTreeData(root) : []);
    loaded.current.clear();
    inFlight.current.clear();
  }, [root]);

  const ensureLoaded = useCallback(
    (path: string, isDir: boolean) => {
      if (!isDir) return;
      if (loaded.current.has(path)) return;
      if (inFlight.current.has(path)) return;
      inFlight.current.add(path);
      mutation.mutate(path, {
        onSuccess: (nodes) => {
          inFlight.current.delete(path);
          loaded.current.add(path);
          setData((prev) =>
            replaceChildrenAt(
              prev,
              path,
              nodes.map(toTreeItem),
            ),
          );
        },
        onError: () => {
          inFlight.current.delete(path);
        },
      });
    },
    [mutation],
  );

  const apiShape = useMemo(
    () => ({ data, ensureLoaded, isLoading: mutation.isPending }),
    [data, ensureLoaded, mutation.isPending],
  );

  return apiShape;
}

function toTreeItem(node: FileNode): TreeItem {
  return {
    id: node.path,
    name: node.name,
    isDir: node.type === "directory",
    path: node.path,
    children:
      node.type === "directory"
        ? node.children
          ? node.children.map(toTreeItem)
          : []
        : undefined,
  };
}

function replaceChildrenAt(
  items: TreeItem[],
  targetPath: string,
  newChildren: TreeItem[],
): TreeItem[] {
  return items.map((item) => {
    if (item.path === targetPath) {
      return { ...item, children: newChildren };
    }
    if (item.isDir && item.children) {
      return {
        ...item,
        children: replaceChildrenAt(item.children, targetPath, newChildren),
      };
    }
    return item;
  });
}
