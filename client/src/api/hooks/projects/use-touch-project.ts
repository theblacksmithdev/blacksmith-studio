import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/**
 * Updates a project's lastOpenedAt timestamp and re-sorts the project list.
 */
export function useTouchProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.projects.touch({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}
