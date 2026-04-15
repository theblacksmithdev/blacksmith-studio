import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";
import type { ProjectRenameInput } from "@/api/types";

/**
 * Renames a project.
 * Invalidates the projects list and the individual project cache.
 */
export function useRenameProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ProjectRenameInput) => api.projects.rename(input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.invalidateQueries({ queryKey: queryKeys.project(id) });
    },
  });
}
