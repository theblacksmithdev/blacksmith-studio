import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Adds a new skill. Invalidates the skills list on success.
 */
export function useAddSkill() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (data: { name: string; description: string; content: string }) =>
      api.skills.add(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.skills })
    },
  })
}
