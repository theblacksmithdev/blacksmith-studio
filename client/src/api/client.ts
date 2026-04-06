export const api = {
  invoke: <T>(channel: string, ...args: any[]): Promise<T> =>
    window.electronAPI!.invoke(channel, ...args),
}
