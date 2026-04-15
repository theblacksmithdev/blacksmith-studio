import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { GitCommitInput } from "@/api/types";

/**
 * Creates a git commit. Invalidates status, changed files, and history on success.
 */
export function useGitCommit() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (input: GitCommitInput) => api.git.commit(projectId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitStatus });
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
      qc.invalidateQueries({ queryKey: keys.gitHistory });
      qc.invalidateQueries({ queryKey: keys.gitSyncStatus });
    },
  });
}
