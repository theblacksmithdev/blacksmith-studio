import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";
import type { RunnerConfigData } from "@/api/types";

/**
 * Updates a runner configuration. Invalidates the configs list on success.
 */
export function useUpdateRunnerConfig() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RunnerConfigData>;
    }) => api.runner.updateConfig(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs });
    },
  });
}
