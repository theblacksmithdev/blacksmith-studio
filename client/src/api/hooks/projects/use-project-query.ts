import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'

/**
 * Fetches a single project by ID from the backend.
 */
export function useProjectQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.project(id ?? ''),
    queryFn: () => api.projects.get({ id: id! }),
    enabled: !!id,
  })
}
