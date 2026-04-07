import { api as raw } from '../client'

export const windowApi = {
  onFullscreen: (cb: (isFullscreen: boolean) => void) => raw.subscribe('window:onFullscreen', cb),
} as const
