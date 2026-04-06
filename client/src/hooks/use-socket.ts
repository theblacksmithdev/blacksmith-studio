import { useEffect } from 'react'
import { useUiStore } from '@/stores/ui-store'

/**
 * With IPC, the connection is always available via the preload bridge.
 * This hook just sets the connection status to 'connected'.
 */
export function useSocket() {
  const setConnectionStatus = useUiStore((s) => s.setConnectionStatus)

  useEffect(() => {
    setConnectionStatus('connected')
  }, [setConnectionStatus])
}
