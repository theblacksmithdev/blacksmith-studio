import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Initializes a git repository in the project directory.
 */
export function useGitInit() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: () => api.git.init(projectId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitStatus })
    },
  })
}
