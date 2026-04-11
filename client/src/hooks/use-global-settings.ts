import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

const GLOBAL_SETTINGS_KEY = ['global-settings']

/**
 * Global app-level settings — no active project required.
 * Project-level settings always override these when both exist.
 */
export function useGlobalSettings() {
  const queryClient = useQueryClient()

  const { data: settings = {} } = useQuery({
    queryKey: GLOBAL_SETTINGS_KEY,
    queryFn: () => api.settings.getAllGlobal(),
  })

  const mutation = useMutation({
    mutationFn: (pair: { key: string; value: any }) =>
      api.settings.updateGlobal({ [pair.key]: pair.value }),
    onSuccess: (updated) => {
      queryClient.setQueryData(GLOBAL_SETTINGS_KEY, updated)
    },
  })

  const get = (key: string): any => settings[key] ?? null
  const set = (key: string, value: any) => mutation.mutate({ key, value })

  return {
    get,
    set,
    nodePath: (settings['runner.nodePath'] as string) ?? '',
  }
}
