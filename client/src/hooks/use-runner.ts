import { useEffect, useCallback, useRef } from "react";
import {
  useRunnerStore,
  RunnerStatus,
  type RunnerService,
  type LogEntry,
} from "@/stores/runner-store";
import { useActiveProjectId, useChannelEffect } from "@/api/hooks/_shared";
import {
  useDetectRunners,
  useStartRunner,
  useStopRunner,
  useRunnerStatusQuery,
  useRunnerLogsQuery,
} from "@/api/hooks/runner";

/**
 * Initializes IPC listeners for runner service status and log output.
 * Hydrates initial state via React Query, then subscribes to live events.
 * Mount once at the ProjectLayout level.
 */
export function useRunnerListener() {
  const projectId = useActiveProjectId();
  const { data: _configs } = useDetectRunners();
  const statusQuery = useRunnerStatusQuery();
  const logsQuery = useRunnerLogsQuery();

  // Clear stale state on project switch
  useEffect(() => {
    if (!projectId) return;
    const store = useRunnerStore.getState();
    store.setServices([]);
    store.clearLogs();
  }, [projectId]);

  // Mirror query data into the store
  useEffect(() => {
    if (statusQuery.data) {
      useRunnerStore
        .getState()
        .setServices(statusQuery.data as RunnerService[]);
    }
  }, [statusQuery.data]);

  useEffect(() => {
    if (logsQuery.data) {
      useRunnerStore.getState().setLogs(logsQuery.data as LogEntry[]);
    }
  }, [logsQuery.data]);

  // Live status events
  useChannelEffect("runner:status", (data) => {
    if (!projectId || data.projectId !== projectId) return;
    useRunnerStore.getState().setServices(data.services as RunnerService[]);
  });

  // Live log output
  useChannelEffect("runner:output", (data) => {
    if (!projectId || data.projectId !== projectId) return;
    useRunnerStore.getState().addLog({
      configId: data.configId,
      name: data.name,
      line: data.line,
      timestamp: data.timestamp,
    });
  });

  // Refetch status on visibility change
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        statusQuery.refetch();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [statusQuery]);
}

/**
 * Runner actions — start, stop, restart individual or all services.
 */
export function useRunner() {
  const startMutation = useStartRunner();
  const stopMutation = useStopRunner();
  const restartCleanupRef = useRef<(() => void) | null>(null);

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
      restartCleanupRef.current?.();
      restartCleanupRef.current = null;

      stopMutation.mutate(configId);

      // Watch the runner store for the Stopped transition, then start again.
      // Using the store avoids another raw IPC subscription here.
      const unsub = useRunnerStore.subscribe((state) => {
        const svc = state.services.find((s) => s.id === configId);
        if (svc?.status === RunnerStatus.Stopped) {
          cleanup();
          startMutation.mutate(configId);
        }
      });

      const timer = setTimeout(() => {
        cleanup();
        startMutation.mutate(configId);
      }, 10_000);

      const cleanup = () => {
        unsub();
        clearTimeout(timer);
        restartCleanupRef.current = null;
      };

      restartCleanupRef.current = cleanup;
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
