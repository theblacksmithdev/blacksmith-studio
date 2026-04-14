import { useEffect, useCallback } from 'react'
import { api } from '@/api'
import { useRunnerStore, RunnerStatus, type RunnerService } from '@/stores/runner-store'
import { useActiveProjectId } from '@/api/hooks/_shared'
import { useDetectRunners, useStartRunner, useStopRunner } from '@/api/hooks/runner'

/**
 * Initializes IPC listeners for runner runtime state (status + logs).
 * Auto-detection runs as a query via useDetectRunners.
 * Mount once at the ProjectLayout level.
 */
export function useRunnerListener() {
  const projectId = useActiveProjectId()

  // Auto-detect runners (seeds DB if no configs yet) — runs as a query
  const { data: _configs } = useDetectRunners()

  // Fetch initial status + replay buffered logs
  useEffect(() => {
    if (!projectId) return

    api.runner.getStatus(projectId).then((status) => {
      useRunnerStore.getState().setServices(status as RunnerService[])
    }).catch(() => {})

    api.runner.getLogs().then((buffered) => {
      if (buffered.length > 0) {
        useRunnerStore.getState().setLogs(buffered)
      }
    }).catch(() => {})

    const unsubs = [
      api.runner.onStatus((data) => {
        useRunnerStore.getState().setServices(data as RunnerService[])
      }),
      api.runner.onOutput((data) => {
        useRunnerStore.getState().addLog({
          configId: data.configId,
          name: data.name,
          line: data.line,
          timestamp: Date.now(),
        })
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [projectId])
}

/**
 * Runner actions — start, stop, restart individual or all services.
 */
export function useRunner() {
  const startMutation = useStartRunner()
  const stopMutation = useStopRunner()

  const start = useCallback((configId?: string) => {
    startMutation.mutate(configId)
  }, [startMutation])

  const stop = useCallback((configId?: string) => {
    stopMutation.mutate(configId)
  }, [stopMutation])

  const restart = useCallback((configId: string) => {
    stopMutation.mutate(configId)
    const unsub = api.runner.onStatus((services: any[]) => {
      const svc = services.find((s: any) => s.id === configId)
      if (svc?.status === RunnerStatus.Stopped) {
        unsub()
        startMutation.mutate(configId)
      }
    })
  }, [startMutation, stopMutation])

  const startAll = useCallback(() => startMutation.mutate(undefined), [startMutation])
  const stopAll = useCallback(() => stopMutation.mutate(undefined), [stopMutation])

  return { start, stop, restart, startAll, stopAll }
}
