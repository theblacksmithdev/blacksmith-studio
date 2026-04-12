import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useRunnerStore, RunnerStatus, type RunnerService } from '@/stores/runner-store'
import { useProjectStore } from '@/stores/project-store'
import { useProjectKeys } from './use-project-keys'

/**
 * Initializes IPC listeners for runner runtime state (status + logs).
 * Also triggers auto-detection on first mount so configs exist in the DB.
 * Mount once at the project layout level.
 *
 * Guards against running before the project is activated —
 * the effect only fires once activeProject is set.
 */
export function useRunnerListener() {
  const activeProject = useProjectStore((s) => s.activeProject)
  const keys = useProjectKeys()
  const qc = useQueryClient()

  useEffect(() => {
    if (!activeProject?.id) return

    // Auto-detect runners (seeds DB if no configs yet), then fetch live status
    api.runner.detectRunners().then(() => {
      qc.invalidateQueries({ queryKey: keys.runnerConfigs })
      return api.runner.getStatus()
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
  }, [activeProject?.id])
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
