import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches merge conflict files.
 */
export function useGitConflictsQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.gitConflicts,
    queryFn: () => api.git.conflicts(projectId!),
    enabled: !!projectId,
  });
}
