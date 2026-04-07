import { useEffect, useCallback } from 'react'
import { useRunnerStore } from '@/stores/runner-store'

/**
 * Initializes WebSocket listeners for runner status and output,
 * and syncs initial state from the main process.
 * Should be mounted once at the project layout level.
 */
export function useRunnerListener() {
  const store = useRunnerStore

  useEffect(() => {
    // Sync current status from the main process on mount.
    // The RunnerManager tracks process state independently,
    // so this picks up servers that are still running after
    // navigating away and back.
    window.electronAPI!.invoke('runner:getStatus').then((status: any) => {
      store.getState().setStatus(status)
    })

    const onStatus = (data: any) => {
      store.getState().setStatus(data)
    }

    const onOutput = (data: { source: 'backend' | 'frontend'; line: string }) => {
      store.getState().addLog({
        source: data.source,
        line: data.line,
        timestamp: Date.now(),
      })
    }

    const unsubs = [
      window.electronAPI!.on('runner:onStatus', onStatus),
      window.electronAPI!.on('runner:onOutput', onOutput),
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
    window.electronAPI!.invoke('runner:start', { target })
  }, [])

  const stop = useCallback((target: 'backend' | 'frontend' | 'all') => {
    window.electronAPI!.invoke('runner:stop', { target })
  }, [])

  return { start, stop }
}
