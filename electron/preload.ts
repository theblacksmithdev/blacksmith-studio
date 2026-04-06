import { contextBridge, ipcRenderer } from 'electron'
import { INVOKE_CHANNELS, SUBSCRIBE_CHANNELS } from './ipc/channels.js'

const invokeAllowlist = new Set<string>(INVOKE_CHANNELS)
const subscribeAllowlist = new Set<string>(SUBSCRIBE_CHANNELS)

contextBridge.exposeInMainWorld('electronAPI', {
  /** Open native folder picker dialog. */
  selectFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:selectFolder'),

  /** Check if running inside Electron. */
  isElectron: true,

  /** Get app version. */
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke('app:getVersion'),

  /** Generic invoke for request/response IPC channels. */
  invoke: (channel: string, ...args: any[]): Promise<any> => {
    if (!invokeAllowlist.has(channel)) {
      return Promise.reject(new Error(`IPC channel not allowed: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },

  /** Subscribe to push/stream IPC channels. Returns unsubscribe function. */
  on: (channel: string, callback: (...args: any[]) => void): (() => void) => {
    if (!subscribeAllowlist.has(channel)) {
      throw new Error(`IPC subscribe channel not allowed: ${channel}`)
    }
    const handler = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
})
