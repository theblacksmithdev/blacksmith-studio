import { useState, useEffect } from 'react'
import { api } from '../client'

export function useWindowState() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const unsub = api.subscribe('window:onFullscreen', (fullscreen: boolean) => {
      setIsFullscreen(fullscreen)
    })
    return unsub
  }, [])

  return { isFullscreen }
}
