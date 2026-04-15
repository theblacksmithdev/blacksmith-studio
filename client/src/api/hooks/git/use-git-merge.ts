import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { GitMergeInput } from "@/api/types";

/**
 * Merges a source branch into a target branch. Invalidates all git state on success.
 */
export function useGitMerge() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (input: GitMergeInput) => api.git.merge(projectId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitStatus });
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
      qc.invalidateQueries({ queryKey: keys.gitHistory });
      qc.invalidateQueries({ queryKey: keys.gitBranches });
      qc.invalidateQueries({ queryKey: keys.gitSyncStatus });
    },
  });
}
