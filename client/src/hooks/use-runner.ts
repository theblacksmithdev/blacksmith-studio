import { useEffect, useCallback } from "react";
import { api } from "@/api";
import {
  useRunnerStore,
  RunnerStatus,
  type RunnerService,
} from "@/stores/runner-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import {
  useDetectRunners,
  useStartRunner,
  useStopRunner,
} from "@/api/hooks/runner";

/**
 * Initializes IPC listener for runner service status.
 * Logs are handled by useChannel('runner:output') in useFilteredLogs.
 * Mount once at the ProjectLayout level.
 */
export function useRunnerListener() {
  const projectId = useActiveProjectId();
  const { data: _configs } = useDetectRunners();

  useEffect(() => {
    if (!projectId) return;

    api.runner
      .getStatus(projectId)
      .then((status) => {
        useRunnerStore.getState().setServices(status as RunnerService[]);
      })
      .catch(() => {});

    const unsub = api.runner.onStatus((data) => {
      useRunnerStore.getState().setServices(data as RunnerService[]);
    });

    return unsub;
  }, [projectId]);
}

/**
 * Runner actions — start, stop, restart individual or all services.
 */
export function useRunner() {
  const startMutation = useStartRunner();
  const stopMutation = useStopRunner();

  const start = useCallback(
    (configId?: string) => {
      startMutation.mutate(configId);
    },
    [startMutation],
  );

  const stop = useCallback(
    (configId?: string) => {
      stopMutation.mutate(configId);
    },
    [stopMutation],
  );

  const restart = useCallback(
    (configId: string) => {
      stopMutation.mutate(configId);
      const unsub = api.runner.onStatus((services: any[]) => {
        const svc = services.find((s: any) => s.id === configId);
        if (svc?.status === RunnerStatus.Stopped) {
          unsub();
          startMutation.mutate(configId);
        }
      });
    },
    [startMutation, stopMutation],
  );

  const startAll = useCallback(
    () => startMutation.mutate(undefined),
    [startMutation],
  );
  const stopAll = useCallback(
    () => stopMutation.mutate(undefined),
    [stopMutation],
  );

  return { start, stop, restart, startAll, stopAll };
}
