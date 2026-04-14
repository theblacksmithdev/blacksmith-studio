import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Generates a commit message from the current diff using AI.
 */
export function useGitGenerateMessage() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: () => api.git.generateMessage(projectId!),
  })
}
