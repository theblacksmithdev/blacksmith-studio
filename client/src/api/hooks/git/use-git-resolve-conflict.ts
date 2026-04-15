import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Resolves a merge conflict for a specific file.
 */
export function useGitResolveConflict() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (input: { path: string; resolution: "ours" | "theirs" }) =>
      api.git.resolveConflict(projectId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitConflicts });
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles });
    },
  });
}
