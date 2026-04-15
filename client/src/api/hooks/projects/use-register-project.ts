import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";
import type { ProjectRegisterInput } from "@/api/types";

/**
 * Registers an existing directory as a project.
 * Invalidates the projects list and active project on success.
 */
export function useRegisterProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ProjectRegisterInput) => api.projects.register(input),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      qc.setQueryData(queryKeys.project(project.id), project);
    },
  });
}
