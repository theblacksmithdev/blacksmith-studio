import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";
import type { RunnerConfigData } from "@/api/types";

/**
 * Adds a new runner configuration. Invalidates the configs list on success.
 */
export function useAddRunnerConfig() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: Partial<RunnerConfigData>) =>
      api.runner.addConfig(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs });
    },
  });
}
