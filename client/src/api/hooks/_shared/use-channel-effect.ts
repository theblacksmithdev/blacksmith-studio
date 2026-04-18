import { useEffect, useRef } from "react";
import {
  channels,
  type ChannelKey,
  type ChannelData,
  type ChannelArgs,
} from "@/api/channels";

/**
 * Imperative companion to useChannel: subscribes to a push channel and
 * fires the given callback for each event. Unlike useChannel this does
 * NOT store events in React state — use it for effect-style reactions
 * (update a Zustand store, invalidate a query, etc.).
 *
 * The callback may change between renders; only the latest is called.
 *
 * @example
 * useChannelEffect('singleAgent:message', (data) => {
 *   chatStore.getState().updateStreamingMessage(data.content)
 * })
 */
export function useChannelEffect<K extends ChannelKey>(
  key: K,
  ...rest: ChannelArgs<K> extends []
    ? [handler: (data: ChannelData<K>) => void]
    : [args: ChannelArgs<K>, handler: (data: ChannelData<K>) => void]
): void {
  const hasArgs = Array.isArray(rest[0]);
  const args = (hasArgs ? rest[0] : []) as any[];
  const handler = (hasArgs ? rest[1] : rest[0]) as (
    data: ChannelData<K>,
  ) => void;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const argsKey = JSON.stringify(args);
  useEffect(() => {
    const channelEntry = channels[key];
    let subscribeFn: (cb: (data: ChannelData<K>) => void) => () => void;
    if (args.length > 0 && typeof channelEntry === "function") {
      subscribeFn = (channelEntry as any)(...args);
    } else {
      subscribeFn = channelEntry as any;
    }
    return subscribeFn((data) => handlerRef.current(data));
  }, [key, argsKey]); // eslint-disable-line react-hooks/exhaustive-deps
}
