import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Detects installed code editors on the system.
 * Global query — not project-scoped.
 */
export function useDetectEditorsQuery() {
  return useQuery({
    queryKey: ['editors'] as const,
    queryFn: () => api.files.detectEditors(),
    staleTime: Infinity,
  })
}
