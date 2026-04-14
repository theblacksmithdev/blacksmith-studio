import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useRunnerStore, RunnerStatus, type RunnerService } from '@/stores/runner-store'
import { useProjectKeys, useActiveProjectId } from '@/api/hooks/_shared'
import { useStartRunner, useStopRunner, useDetectRunners } from '@/api/hooks/runner'

/**
 * Initializes IPC listeners for runner runtime state (status + logs).
 * Also triggers auto-detection on first mount so configs exist in the DB.
 * Mount once at the project layout level.
 */
export function useRunnerListener() {
  const keys = useProjectKeys()
  const qc = useQueryClient()
  const projectId = useActiveProjectId()
  const detectRunners = useDetectRunners()

  useEffect(() => {
    if (!projectId) return

    // Auto-detect runners (seeds DB if no configs yet), then fetch live status
    detectRunners.mutateAsync().then(() => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
      return api.runner.getStatus(projectId)
    }).then((status) => {
      useRunnerStore.getState().setServices(status as RunnerService[])
    }).catch(() => {})

    // Replay buffered logs from the server (survives page reload)
    api.runner.getLogs().then((buffered) => {
      if (buffered.length > 0) {
        useRunnerStore.getState().setLogs(buffered)
      }
    }).catch(() => {})

    const unsubs = [
      // Live status pushes
      api.runner.onStatus((data) => {
        useRunnerStore.getState().setServices(data as RunnerService[])
      }),
      // Live log output
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
    // Wait for the service to stop, then start it again
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
