import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { channels, type ChannelKey, type ChannelData } from '@/api/channels'

interface ChannelOptions<T> {
  /** Max items to keep in history (0 = unlimited). Default: 0 */
  maxHistory?: number
  /** If true, each event replaces state instead of appending. Default: false */
  replace?: boolean
  /** Filter events — only matching events are stored. */
  filter?: (data: T) => boolean
}

interface ChannelResult<T> {
  /** All accumulated messages (or single item if replace: true) */
  messages: T[]
  /** The most recent message */
  last: T | null
  /** Number of messages received */
  count: number
  /** Whether any message has been received */
  hasData: boolean
  /** Clear all messages */
  clear: () => void
}

/**
 * Reusable hook for subscribing to IPC push/stream channels.
 *
 * Pass a registered channel key — types are inferred automatically.
 *
 * @example
 * const { last: status } = useChannel('git:statusChange', { replace: true })
 *
 * const { messages: logs } = useChannel('runner:output', {
 *   maxHistory: 1000,
 *   filter: (data) => data.configId === activeId,
 * })
 *
 * const { messages, last } = useChannel('claude:message')
 */
export function useChannel<K extends ChannelKey>(
  key: K,
  options?: ChannelOptions<ChannelData<K>>,
): ChannelResult<ChannelData<K>> {
  type T = ChannelData<K>

  // Store options in refs so the subscription effect doesn't rerun when
  // the consumer passes unstable function references (e.g. inline filter)
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Immutable snapshot — replaced on every mutation so useSyncExternalStore detects changes
  const snapshotRef = useRef<T[]>([])
  const listenersRef = useRef(new Set<() => void>())

  const emit = useCallback(() => {
    listenersRef.current.forEach((cb) => cb())
  }, [])

  const push = useCallback((data: T) => {
    const { maxHistory = 0, replace = false, filter } = optionsRef.current ?? {}

    if (filter && !filter(data)) return

    if (replace) {
      snapshotRef.current = [data]
    } else {
      const next = [...snapshotRef.current, data]
      snapshotRef.current = maxHistory > 0 && next.length > maxHistory
        ? next.slice(-maxHistory)
        : next
    }
    emit()
  }, [emit])

  // Subscribe to the IPC channel — only reruns if the channel key changes
  useEffect(() => {
    const subscribeFn = channels[key] as (cb: (data: T) => void) => () => void
    const unsub = subscribeFn(push)
    return unsub
  }, [key, push])

  // useSyncExternalStore for React-safe batched reads
  const subscribeStore = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => listenersRef.current.delete(cb)
  }, [])

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const messages = useSyncExternalStore(subscribeStore, getSnapshot)

  const clear = useCallback(() => {
    snapshotRef.current = []
    emit()
  }, [emit])

  return {
    messages,
    last: messages.length > 0 ? messages[messages.length - 1] : null,
    count: messages.length,
    hasData: messages.length > 0,
    clear,
  }
}
