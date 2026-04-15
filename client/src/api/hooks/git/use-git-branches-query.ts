import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the list of git branches.
 */
export function useGitBranchesQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.gitBranches,
    queryFn: () => api.git.listBranches(projectId!),
    enabled: !!projectId,
  });
}
