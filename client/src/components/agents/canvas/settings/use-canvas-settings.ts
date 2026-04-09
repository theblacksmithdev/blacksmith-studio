import { useCallback, useMemo } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { CANVAS_DEFAULTS, type CanvasSettings } from './types'

const KEY = 'agents.canvasSettings'

export function useCanvasSettings() {
  const settings = useSettings()
  const stored = settings.get(KEY)

  const canvas: CanvasSettings = useMemo(() => {
    if (!stored || typeof stored !== 'object') return CANVAS_DEFAULTS
    return { ...CANVAS_DEFAULTS, ...stored }
  }, [stored])

  const update = useCallback(
    <K extends keyof CanvasSettings>(key: K, value: CanvasSettings[K]) => {
      const current = (typeof stored === 'object' && stored) ? stored : {}
      settings.set(KEY, { ...CANVAS_DEFAULTS, ...current, [key]: value })
    },
    [stored, settings],
  )

  const reset = useCallback(() => {
    settings.set(KEY, CANVAS_DEFAULTS)
  }, [settings])

  return { canvas, update, reset }
}
