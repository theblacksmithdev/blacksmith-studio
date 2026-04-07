import { useEffect, useCallback } from 'react'
import { api } from '@/api'
import { useRunnerStore } from '@/stores/runner-store'

/**
 * Initializes IPC listeners for runner status and output,
 * and syncs initial state from the main process.
 * Should be mounted once at the project layout level.
 */
export function useRunnerListener() {
  const store = useRunnerStore

  useEffect(() => {
    api.runner.getStatus().then((status) => {
      store.getState().setStatus(status as any)
    })

    const unsubs = [
      api.runner.onStatus((data) => {
        store.getState().setStatus(data as any)
      }),
      api.runner.onOutput((data) => {
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
    api.runner.start({ target })
  }, [])

  const stop = useCallback((target: 'backend' | 'frontend' | 'all') => {
    api.runner.stop({ target })
  }, [])

  return { start, stop }
}
