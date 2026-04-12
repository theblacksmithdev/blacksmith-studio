import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useRunnerStore, RunnerStatus, type RunnerService } from '@/stores/runner-store'
import { useProjectKeys } from './use-project-keys'

/**
 * Initializes IPC listeners for runner runtime state (status + logs).
 * Also triggers auto-detection on first mount so configs exist in the DB.
 * Mount once at the project layout level.
 */
export function useRunnerListener() {
  const store = useRunnerStore
  const keys = useProjectKeys()
  const qc = useQueryClient()

  useEffect(() => {
    // Auto-detect runners (seeds DB if no configs yet), then fetch live status
    api.runner.detectRunners().then(() => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
      // Fetch initial live status separately
      return api.runner.getStatus()
    }).then((status) => {
      store.getState().setServices(status as RunnerService[])
    }).catch(() => {})

    const unsubs = [
      // Live status pushes
      api.runner.onStatus((data) => {
        store.getState().setServices(data as RunnerService[])
      }),
      // Live log output — name comes from the server, not the store
      api.runner.onOutput((data) => {
        store.getState().addLog({
          configId: data.configId,
          name: data.name,
          line: data.line,
          timestamp: Date.now(),
        })
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [keys.runnerConfigs])
}

/**
 * Runner actions — start, stop, restart individual or all services.
 */
export function useRunner() {
  const start = useCallback((configId?: string) => {
    api.runner.start(configId)
  }, [])

  const stop = useCallback((configId?: string) => {
    api.runner.stop(configId)
  }, [])

  const restart = useCallback((configId: string) => {
    api.runner.stop(configId)
    const unsub = api.runner.onStatus((services: any[]) => {
      const svc = services.find((s: any) => s.id === configId)
      if (svc?.status === RunnerStatus.Stopped) {
        unsub()
        api.runner.start(configId)
      }
    })
  }, [])

  const startAll = useCallback(() => api.runner.start(), [])
  const stopAll = useCallback(() => api.runner.stop(), [])

  return { start, stop, restart, startAll, stopAll }
}
