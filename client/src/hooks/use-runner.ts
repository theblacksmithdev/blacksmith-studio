import { useEffect, useCallback } from 'react'
import { useRunnerStore } from '@/stores/runner-store'

export function useRunner() {
  const store = useRunnerStore

  useEffect(() => {
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

  const start = useCallback((target: 'backend' | 'frontend' | 'all') => {
    window.electronAPI!.invoke('runner:start', { target })
  }, [])

  const stop = useCallback((target: 'backend' | 'frontend' | 'all') => {
    window.electronAPI!.invoke('runner:stop', { target })
  }, [])

  return { start, stop }
}
