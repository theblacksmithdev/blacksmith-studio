import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";
import type { FileNode } from "@/api/types";

/**
 * Lazy-load a folder's direct children on demand.
 */
export function useFileChildren() {
  const projectId = useActiveProjectId();
  return useMutation<FileNode[], Error, string>({
    mutationFn: (path) => api.files.children(projectId!, path),
  });
}
