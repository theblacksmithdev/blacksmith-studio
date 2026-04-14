import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches git commit history.
 */
export function useGitHistoryQuery(limit?: number) {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.gitHistory,
    queryFn: () => api.git.history(projectId!, limit ? { limit } : undefined),
    enabled: !!projectId,
  })
}
