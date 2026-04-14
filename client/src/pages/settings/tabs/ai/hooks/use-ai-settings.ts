import { useCallback } from 'react'
import { useSettingsQuery, useUpdateSettings } from '@/api/hooks/settings'

export const MODELS = [
  { value: 'sonnet', label: 'Sonnet', desc: 'Fast & capable' },
  { value: 'opus', label: 'Opus', desc: 'Most intelligent' },
  { value: 'haiku', label: 'Haiku', desc: 'Fastest responses' },
] as const

export const PERMISSION_OPTIONS = [
  { value: 'bypassPermissions', label: 'Auto-approve' },
  { value: 'auto', label: 'Smart' },
  { value: 'default', label: 'Ask each time' },
] as const

export function useAiSettings() {
  const { data: settings = {} } = useSettingsQuery()
  const updateMutation = useUpdateSettings()

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  )

  return {
    // State
    model: (settings['ai.model'] ?? 'sonnet') as string,
    permissionMode: (settings['ai.permissionMode'] ?? 'bypassPermissions') as string,
    maxBudget: settings['ai.maxBudget'] as number | null,
    customInstructions: (settings['ai.customInstructions'] ?? '') as string,

    // Mutations
    setModel: (value: string) => set('ai.model', value),
    setPermissionMode: (value: string) => set('ai.permissionMode', value),
    setBudget: (value: number | string | null) => set('ai.maxBudget', value === '' || value === 0 ? null : value),
    setCustomInstructions: (value: string) => set('ai.customInstructions', value),
  }
}
