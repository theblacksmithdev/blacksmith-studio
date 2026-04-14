import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Fetches the app version from the backend.
 * Cached indefinitely — version doesn't change at runtime.
 */
export function useAppVersion() {
  return useQuery({
    queryKey: ['window', 'version'] as const,
    queryFn: async () => {
      const state = await api.window.getState()
      return state.version
    },
    staleTime: Infinity,
  })
}
