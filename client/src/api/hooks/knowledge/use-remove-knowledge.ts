import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Removes a knowledge document. Invalidates the knowledge list on success.
 */
export function useRemoveKnowledge() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (name: string) => api.knowledge.remove(projectId!, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.knowledge })
    },
  })
}
