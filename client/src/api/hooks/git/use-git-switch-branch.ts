import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Switches to a different git branch. Invalidates all git state on success.
 */
export function useGitSwitchBranch() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (name: string) => api.git.switchBranch(projectId!, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitStatus });
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
      qc.invalidateQueries({ queryKey: keys.gitHistory });
      qc.invalidateQueries({ queryKey: keys.gitBranches });
      qc.invalidateQueries({ queryKey: keys.gitSyncStatus });
    },
  });
}
