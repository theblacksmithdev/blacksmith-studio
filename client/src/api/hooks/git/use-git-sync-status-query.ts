import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the push/pull sync status (ahead/behind counts).
 */
export function useGitSyncStatusQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.gitSyncStatus,
    queryFn: () => api.git.syncStatus(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
