export const api = {
  /** Request/response IPC call. */
  invoke: <T>(channel: string, ...args: any[]): Promise<T> =>
    window.electronAPI!.invoke(channel, ...args),

  /** Subscribe to a push/stream IPC channel. Returns unsubscribe function. */
  subscribe: (channel: string, callback: (...args: any[]) => void): (() => void) =>
    window.electronAPI!.on(channel, callback),
}
