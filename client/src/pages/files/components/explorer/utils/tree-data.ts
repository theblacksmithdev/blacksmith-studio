import type { FileNode } from "@/types";

/**
 * Converts the FileNode tree into the flat data shape react-arborist expects.
 * react-arborist wants: { id, name, children? }[]
 */
export interface TreeItem {
  id: string;
  name: string;
  isDir: boolean;
  path: string;
  children?: TreeItem[];
}

export function toTreeData(node: FileNode): TreeItem[] {
  if (!node.children) return [];

  return node.children
    .slice()
    .sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((child) => ({
      id: child.path,
      name: child.name,
      isDir: child.type === "directory",
      path: child.path,
      children: child.type === "directory" ? toTreeData(child) : undefined,
    }));
}

/** Search filter — returns true if node or any descendant matches */
export function matchesSearch(item: TreeItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (item.name.toLowerCase().includes(q)) return true;
  if (item.children) return item.children.some((c) => matchesSearch(c, q));
  return false;
}

export function filterTree(items: TreeItem[], query: string): TreeItem[] {
  if (!query) return items;
  return items
    .filter((item) => matchesSearch(item, query))
    .map((item) => ({
      ...item,
      children: item.children ? filterTree(item.children, query) : undefined,
    }));
}
