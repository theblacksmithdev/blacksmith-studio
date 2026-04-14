import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useActiveProjectId } from '../_shared'

/**
 * Checks system health — Claude installation, project status.
 * Optionally scoped to a project if inside a project route.
 */
export function useHealthCheckQuery() {
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.health.check(projectId),
  })
}
