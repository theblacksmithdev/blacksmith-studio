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

interface ChannelState<T> {
  messages: T[]
  version: number
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
 * // State replacement
 * const { last: status } = useChannel('git:statusChange', { replace: true })
 *
 * // Bounded log buffer for a specific service
 * const { messages: logs } = useChannel('runner:output', {
 *   maxHistory: 1000,
 *   filter: (data) => data.configId === activeId,
 * })
 *
 * // Unbounded accumulation
 * const { messages, last } = useChannel('claude:message')
 *
 * // Filtered events
 * const { messages } = useChannel('terminal:output', {
 *   filter: (event) => event.id === terminalId,
 * })
 */
export function useChannel<K extends ChannelKey>(
  key: K,
  options?: ChannelOptions<ChannelData<K>>,
): ChannelResult<ChannelData<K>> {
  type T = ChannelData<K>
  const { maxHistory = 0, replace = false, filter } = options ?? {}

  const stateRef = useRef<ChannelState<T>>({ messages: [], version: 0 })
  const listenersRef = useRef(new Set<() => void>())

  const emit = useCallback(() => {
    listenersRef.current.forEach((cb) => cb())
  }, [])

  const push = useCallback((data: T) => {
    if (filter && !filter(data)) return

    const state = stateRef.current
    if (replace) {
      state.messages = [data]
    } else {
      state.messages = [...state.messages, data]
      if (maxHistory > 0 && state.messages.length > maxHistory) {
        state.messages = state.messages.slice(-maxHistory)
      }
    }
    state.version++
    emit()
  }, [filter, replace, maxHistory, emit])

  useEffect(() => {
    const subscribeFn = channels[key] as (cb: (data: T) => void) => () => void
    const unsub = subscribeFn(push)
    return () => {
      unsub()
      stateRef.current = { messages: [], version: 0 }
    }
  }, [key, push])

  const subscribeStore = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => listenersRef.current.delete(cb)
  }, [])

  const getSnapshot = useCallback(() => stateRef.current, [])

  const state = useSyncExternalStore(subscribeStore, getSnapshot)

  const clear = useCallback(() => {
    stateRef.current = { messages: [], version: stateRef.current.version + 1 }
    emit()
  }, [emit])

  return {
    messages: state.messages,
    last: state.messages.length > 0 ? state.messages[state.messages.length - 1] : null,
    count: state.messages.length,
    hasData: state.messages.length > 0,
    clear,
  }
}
