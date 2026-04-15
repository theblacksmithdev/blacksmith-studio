import { useEffect, useCallback, useRef } from "react";
import { api } from "@/api";
import {
  useRunnerStore,
  RunnerStatus,
  type RunnerService,
  type LogEntry,
} from "@/stores/runner-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import {
  useDetectRunners,
  useStartRunner,
  useStopRunner,
} from "@/api/hooks/runner";

/**
 * Initializes IPC listeners for runner service status and log output.
 * Hydrates initial state from server buffer, then subscribes to live events.
 * Mount once at the ProjectLayout level.
 */
export function useRunnerListener() {
  const projectId = useActiveProjectId();
  const { data: _configs } = useDetectRunners();

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    const store = useRunnerStore.getState();

    // Clear stale data from previous project immediately
    store.setServices([]);
    store.clearLogs();

    // Hydrate initial status
    api.runner
      .getStatus(projectId)
      .then((status) => {
        if (!cancelled) {
          useRunnerStore.getState().setServices(status as RunnerService[]);
        }
      })
      .catch(() => {});

    // Hydrate initial logs from server buffer
    api.runner
      .getLogs(projectId)
      .then((logs) => {
        if (!cancelled) {
          useRunnerStore.getState().setLogs(logs as LogEntry[]);
        }
      })
      .catch(() => {});

    // Live status subscription — only accept events for this project
    const unsubStatus = api.runner.onStatus((data) => {
      if (cancelled || data.projectId !== projectId) return;
      useRunnerStore.getState().setServices(data.services as RunnerService[]);
    });

    // Live output subscription — only accept events for this project
    const unsubOutput = api.runner.onOutput((data) => {
      if (cancelled || data.projectId !== projectId) return;
      useRunnerStore.getState().addLog({
        configId: data.configId,
        name: data.name,
        line: data.line,
        timestamp: data.timestamp,
      });
    });

    // Re-fetch status when window regains focus (covers event gaps)
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && projectId && !cancelled) {
        api.runner
          .getStatus(projectId)
          .then((status) => {
            if (!cancelled) {
              useRunnerStore.getState().setServices(status as RunnerService[]);
            }
          })
          .catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      unsubStatus();
      unsubOutput();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [projectId]);
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
      // Clean up any previous restart listener
      restartCleanupRef.current?.();
      restartCleanupRef.current = null;

      stopMutation.mutate(configId);

      const unsub = api.runner.onStatus((data) => {
        const svc = data.services.find((s) => s.id === configId);
        if (svc?.status === RunnerStatus.Stopped) {
          cleanup();
          startMutation.mutate(configId);
        }
      });

      // Force-start after timeout if stop never confirms
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
