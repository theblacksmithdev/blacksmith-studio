import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches detailed info for a single commit by hash.
 */
export function useGitCommitDetailQuery(hash: string | undefined) {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.gitCommitDetail(hash ?? ''),
    queryFn: () => api.git.commitDetail(projectId!, { hash: hash! }),
    enabled: !!projectId && !!hash,
    staleTime: Infinity,
  })
}
