import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'
import type { SettingsMap } from '@/api/types'

/**
 * Updates project-scoped settings.
 * Optimistically updates the cache and rolls back on error.
 */
export function useUpdateSettings() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (data: SettingsMap) => api.settings.update(projectId!, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: keys.settings })
      const previous = qc.getQueryData<SettingsMap>(keys.settings)
      qc.setQueryData(keys.settings, (old: SettingsMap = {}) => ({ ...old, ...data }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(keys.settings, context.previous)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.settings })
    },
  })
}
