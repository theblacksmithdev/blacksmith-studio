import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Triggers a Graphify graph build. Invalidates status on success.
 */
export function useGraphifyBuild() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: () => api.graphify.build(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.graphifyStatus });
    },
  });
}
