import { api as raw } from '../client'

export interface WindowState {
  isFullscreen: boolean
  isMaximized: boolean
  isFocused: boolean
  version: string
}

export const windowApi = {
  getState: () => raw.invoke<WindowState>('window:getState'),

  onFullscreen: (cb: (isFullscreen: boolean) => void) => raw.subscribe('window:onFullscreen', cb),
} as const
