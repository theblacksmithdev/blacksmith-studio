import { ipcMain, app, type BrowserWindow } from 'electron'
import { WINDOW_GET_STATE } from './channels.js'

export interface WindowState {
  isFullscreen: boolean
  isMaximized: boolean
  isFocused: boolean
  version: string
}

export function setupWindowIPC(getWindow: () => BrowserWindow | null) {
  ipcMain.handle(WINDOW_GET_STATE, (): WindowState => {
    const win = getWindow()
    return {
      isFullscreen: win?.isFullScreen() ?? false,
      isMaximized: win?.isMaximized() ?? false,
      isFocused: win?.isFocused() ?? false,
      version: app.getVersion(),
    }
  })
}
