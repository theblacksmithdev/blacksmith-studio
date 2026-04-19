import { useQueryClient } from "@tanstack/react-query";
import {
  useAddRunnerConfig,
  useDetectRunners,
  useRemoveRunnerConfig,
  useRunnerConfigsQuery,
  useUpdateRunnerConfig,
} from "@/api/hooks/runner";
import { useProjectKeys } from "@/api/hooks/_shared";
import type { RunnerConfigData } from "@/api/types";

export interface UseProjectRunnerSetup {
  configs: RunnerConfigData[];
  hasConfigs: boolean;
  loading: boolean;
  add: (data: Partial<RunnerConfigData>) => Promise<RunnerConfigData>;
  adding: boolean;
  update: (id: string, updates: Partial<RunnerConfigData>) => Promise<RunnerConfigData>;
  updating: boolean;
  remove: (id: string) => Promise<void>;
  removing: boolean;
  autoDetect: () => Promise<RunnerConfigData[]>;
  detecting: boolean;
  refetch: () => void;
}

/**
 * Composes the runner hooks into one shape the runner step can lean on:
 * list + add + update + remove + auto-detect. No UI assumptions — the
 * step decides how to present each action.
 */
export function useProjectRunnerSetup(): UseProjectRunnerSetup {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  const configsQuery = useRunnerConfigsQuery();
  const addMutation = useAddRunnerConfig();
  const updateMutation = useUpdateRunnerConfig();
  const removeMutation = useRemoveRunnerConfig();
  const detectQuery = useDetectRunners();

  const configs = configsQuery.data ?? [];

  const add = (data: Partial<RunnerConfigData>) =>
    addMutation.mutateAsync(data);

  const update = (id: string, updates: Partial<RunnerConfigData>) =>
    updateMutation.mutateAsync({ id, updates });

  const remove = async (id: string) => {
    await removeMutation.mutateAsync(id);
  };

  const autoDetect = async () => {
    const result = await detectQuery.refetch();
    qc.invalidateQueries({ queryKey: keys.runnerConfigs });
    return result.data ?? [];
  };

  return {
    configs,
    hasConfigs: configs.length > 0,
    loading: configsQuery.isLoading,
    add,
    adding: addMutation.isPending,
    update,
    updating: updateMutation.isPending,
    remove,
    removing: removeMutation.isPending,
    autoDetect,
    detecting: detectQuery.isFetching,
    refetch: () => configsQuery.refetch(),
  };
}
