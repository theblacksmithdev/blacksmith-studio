import { api as raw } from "../client";
import type { FileNode, FileContentResult, FilesChangedEvent } from "../types";

export interface SearchResult {
  path: string;
  name: string;
  matches: { line: number; text: string }[];
}

export interface DetectedEditor {
  id: string;
  name: string;
  command: string;
}

export const files = {
  tree: (projectId: string) =>
    raw.invoke<FileNode>("files:tree", { projectId }),
  children: (projectId: string, path: string) =>
    raw.invoke<FileNode[]>("files:children", { projectId, path }),
  content: (projectId: string, path: string) =>
    raw.invoke<FileContentResult>("files:content", { projectId, path }),
  search: (projectId: string, query: string, maxResults?: number) =>
    raw.invoke<SearchResult[]>("files:search", {
      projectId,
      query,
      maxResults,
    }),
  reveal: (projectId: string, path: string) =>
    raw.invoke<void>("files:reveal", { projectId, path }),
  detectEditors: () => raw.invoke<DetectedEditor[]>("files:detectEditors"),
  openInEditor: (projectId: string, path: string, command?: string) =>
    raw.invoke<void>("files:openInEditor", { projectId, path, command }),
  save: (projectId: string, path: string, content: string) =>
    raw.invoke<void>("files:save", { projectId, path, content }),
  rename: (projectId: string, path: string, newName: string) =>
    raw.invoke<{ newPath: string }>("files:rename", {
      projectId,
      path,
      newName,
    }),
  delete: (projectId: string, path: string) =>
    raw.invoke<void>("files:delete", { projectId, path }),

  onChanged: (cb: (data: FilesChangedEvent) => void) =>
    raw.subscribe("files:onChanged", cb),
} as const;
