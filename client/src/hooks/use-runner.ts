import { useEffect, useCallback } from 'react'
import { api } from '@/api'
import { useRunnerStore, type RunnerService } from '@/stores/runner-store'

/**
 * Initializes IPC listeners for runner status and output.
 * Mount once at the project layout level.
 */
export function useRunnerListener() {
  const store = useRunnerStore

  useEffect(() => {
    // Fetch initial status and auto-detect runners
    api.runner.detectRunners().then((services) => {
      store.getState().setServices(services as RunnerService[])
    }).catch(() => {})

    const unsubs = [
      api.runner.onStatus((data) => {
        store.getState().setServices(data as RunnerService[])
      }),
      api.runner.onOutput((data) => {
        // Find the service name for the log entry
        const svc = store.getState().services.find((s) => s.id === data.configId)
        store.getState().addLog({
          configId: data.configId,
          name: svc?.name ?? 'Unknown',
          line: data.line,
          timestamp: Date.now(),
        })
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [])
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
      if (svc?.status === 'stopped') {
        unsub()
        api.runner.start(configId)
      }
    })
  }, [])

  const startAll = useCallback(() => api.runner.start(), [])
  const stopAll = useCallback(() => api.runner.stop(), [])

  return { start, stop, restart, startAll, stopAll }
}
