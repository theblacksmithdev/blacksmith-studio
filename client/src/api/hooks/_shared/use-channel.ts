import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import {
  channels,
  type ChannelKey,
  type ChannelData,
  type ChannelArgs,
} from "@/api/channels";

interface ChannelOptions<T> {
  /** Max items to keep in history (0 = unlimited). Default: 0 */
  maxHistory?: number;
  /** If true, each event replaces state instead of appending. Default: false */
  replace?: boolean;
  /** Filter events — only matching events are stored. */
  filter?: (data: T) => boolean;
  /** Arguments passed to factory channels (e.g. projectId, configId). */
  args?: any[];
}

interface ChannelResult<T> {
  /** All accumulated messages (or single item if replace: true) */
  messages: T[];
  /** The most recent message */
  last: T | null;
  /** Number of messages received */
  count: number;
  /** Whether any message has been received */
  hasData: boolean;
  /** Clear all messages */
  clear: () => void;
}

/**
 * Reusable hook for subscribing to IPC push/stream channels.
 *
 * Pass a registered channel key — types are inferred automatically.
 * For factory channels that require arguments, pass them via `args`.
 *
 * @example
 * // Direct channel (no args)
 * const { last: status } = useChannel('git:statusChange', { replace: true })
 *
 * // With args (factory channel)
 * const { messages } = useChannel('runner:output', {
 *   args: [projectId],
 *   maxHistory: 1000,
 *   filter: (data) => data.configId === activeId,
 * })
 *
 * // Unbounded accumulation
 * const { messages, last } = useChannel('claude:message')
 */
export function useChannel<K extends ChannelKey>(
  key: K,
  ...rest: ChannelArgs<K> extends []
    ? [options?: ChannelOptions<ChannelData<K>>]
    : [args: ChannelArgs<K>, options?: ChannelOptions<ChannelData<K>>]
): ChannelResult<ChannelData<K>> {
  type T = ChannelData<K>;

  // Parse overloaded arguments
  const hasArgs = Array.isArray(rest[0]);
  const args = (hasArgs ? rest[0] : []) as any[];
  const options = (hasArgs ? rest[1] : rest[0]) as
    | ChannelOptions<T>
    | undefined;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const snapshotRef = useRef<T[]>([]);
  const listenersRef = useRef(new Set<() => void>());

  const emit = useCallback(() => {
    listenersRef.current.forEach((cb) => cb());
  }, []);

  const push = useCallback(
    (data: T) => {
      const {
        maxHistory = 0,
        replace = false,
        filter,
      } = optionsRef.current ?? {};

      if (filter && !filter(data)) return;

      if (replace) {
        snapshotRef.current = [data];
      } else {
        const next = [...snapshotRef.current, data];
        snapshotRef.current =
          maxHistory > 0 && next.length > maxHistory
            ? next.slice(-maxHistory)
            : next;
      }
      emit();
    },
    [emit],
  );

  // Subscribe — reruns if the channel key or args change
  const argsKey = JSON.stringify(args);
  useEffect(() => {
    const channelEntry = channels[key];
    let subscribeFn: (cb: (data: T) => void) => () => void;

    if (args.length > 0 && typeof channelEntry === "function") {
      // Factory channel: call with args to get the subscribe function
      subscribeFn = (channelEntry as any)(...args);
    } else {
      subscribeFn = channelEntry as any;
    }

    const unsub = subscribeFn(push);
    return unsub;
  }, [key, argsKey, push]);

  const subscribeStore = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  const getSnapshot = useCallback(() => snapshotRef.current, []);
  const messages = useSyncExternalStore(subscribeStore, getSnapshot);

  const clear = useCallback(() => {
    snapshotRef.current = [];
    emit();
  }, [emit]);

  return {
    messages,
    last: messages.length > 0 ? messages[messages.length - 1] : null,
    count: messages.length,
    hasData: messages.length > 0,
    clear,
  };
}
