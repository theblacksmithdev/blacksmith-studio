import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Removes a runner configuration. Invalidates the configs list on success.
 */
export function useRemoveRunnerConfig() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (id: string) => api.runner.removeConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs });
    },
  });
}
