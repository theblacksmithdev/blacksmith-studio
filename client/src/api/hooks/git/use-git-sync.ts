import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Pushes and pulls from the remote. Invalidates all git state on success.
 */
export function useGitSync() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: () => api.git.sync(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitStatus });
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
      qc.invalidateQueries({ queryKey: keys.gitHistory });
      qc.invalidateQueries({ queryKey: keys.gitBranches });
      qc.invalidateQueries({ queryKey: keys.gitSyncStatus });
    },
  });
}
