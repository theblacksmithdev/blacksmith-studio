import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Creates a new git branch. Invalidates branches on success.
 */
export function useGitCreateBranch() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (name: string) => api.git.createBranch(projectId!, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitBranches });
    },
  });
}
