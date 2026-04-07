import { useEffect, useCallback } from 'react'
import { api } from '@/api/client'
import { useRunnerStore } from '@/stores/runner-store'

/**
 * Initializes IPC listeners for runner status and output,
 * and syncs initial state from the main process.
 * Should be mounted once at the project layout level.
 */
export function useRunnerListener() {
  const store = useRunnerStore

  useEffect(() => {
    // Sync current status from the main process on mount
    api.invoke('runner:getStatus').then((status: any) => {
      store.getState().setStatus(status)
    })

    const unsubs = [
      api.subscribe('runner:onStatus', (data: any) => {
        store.getState().setStatus(data)
      }),
      api.subscribe('runner:onOutput', (data: { source: 'backend' | 'frontend'; line: string }) => {
        store.getState().addLog({
          source: data.source,
          line: data.line,
          timestamp: Date.now(),
        })
      }),
    ]

    return () => unsubs.forEach((unsub) => unsub())
  }, [])
}

/**
 * Returns runner start/stop actions.
 * Can be used from any component.
 */
export function useRunner() {
  const start = useCallback((target: 'backend' | 'frontend' | 'all') => {
    api.invoke('runner:start', { target })
  }, [])

  const stop = useCallback((target: 'backend' | 'frontend' | 'all') => {
    api.invoke('runner:stop', { target })
  }, [])

  return { start, stop }
}
