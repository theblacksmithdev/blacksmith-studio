import { useCallback } from 'react'
import { useSettingsQuery, useUpdateSettings } from '@/api/hooks/settings'

export const TAB_SIZE_OPTIONS = [
  { value: '2', label: '2 spaces' },
  { value: '4', label: '4 spaces' },
] as const

export function useEditorSettings() {
  const { data: settings = {} } = useSettingsQuery()
  const updateMutation = useUpdateSettings()

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  )

  return {
    tabSize: (settings['editor.tabSize'] ?? 2) as number,
    wordWrap: (settings['editor.wordWrap'] ?? true) as boolean,
    minimap: (settings['editor.minimap'] ?? true) as boolean,
    lineNumbers: (settings['editor.lineNumbers'] ?? true) as boolean,

    setTabSize: (value: string) => set('editor.tabSize', Number(value)),
    setWordWrap: (value: boolean) => set('editor.wordWrap', value),
    setMinimap: (value: boolean) => set('editor.minimap', value),
    setLineNumbers: (value: boolean) => set('editor.lineNumbers', value),
  }
}
