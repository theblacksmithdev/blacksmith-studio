import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the file tree for the active project.
 */
export function useFileTreeQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.files,
    queryFn: () => api.files.tree(projectId!),
    enabled: !!projectId,
  });
}
