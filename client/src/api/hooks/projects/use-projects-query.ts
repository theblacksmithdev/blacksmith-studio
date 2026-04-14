import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'

/**
 * Fetches the list of all projects.
 */
export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.projects.list(),
  })
}
