import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Updates global settings. Invalidates the global settings cache on success.
 */
export function useUpdateGlobalSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, any>) => api.settings.updateGlobal(data),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['settings', 'global'] })
    },
  })
}
