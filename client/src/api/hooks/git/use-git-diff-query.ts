import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches the diff for a specific file.
 */
export function useGitDiffQuery(filePath?: string) {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.gitDiff(filePath ?? ''),
    queryFn: () => api.git.diff(projectId!, { path: filePath! }),
    enabled: !!projectId && !!filePath,
    staleTime: 5_000,
  })
}
