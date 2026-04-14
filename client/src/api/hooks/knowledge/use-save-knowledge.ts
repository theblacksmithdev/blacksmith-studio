import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Saves content to a knowledge document. Invalidates the knowledge list on success.
 */
export function useSaveKnowledge() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (data: { name: string; content: string }) =>
      api.knowledge.save(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.knowledge })
    },
  })
}
