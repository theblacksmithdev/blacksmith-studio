import { useState, useEffect } from 'react'
import { api } from '@/api'

export function useWindowState() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const unsub = api.window.onFullscreen((fullscreen) => {
      setIsFullscreen(fullscreen)
    })
    return unsub
  }, [])

  return { isFullscreen }
}
