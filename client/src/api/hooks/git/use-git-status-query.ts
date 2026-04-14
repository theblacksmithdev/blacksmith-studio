import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches git status for the active project.
 */
export function useGitStatusQuery() {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.gitStatus,
    queryFn: () => api.git.status(projectId!),
    enabled: !!projectId,
  })
}
