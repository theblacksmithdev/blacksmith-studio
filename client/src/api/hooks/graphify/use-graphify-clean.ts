import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Cleans Graphify graph artifacts. Invalidates status on success.
 */
export function useGraphifyClean() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: () => api.graphify.clean(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.graphifyStatus });
    },
  });
}
