import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import type { ProjectRemoveInput } from '@/api/types'

/**
 * Removes a project. Optionally deletes the directory on disk (`hard: true`).
 * Invalidates the projects list and active project on success.
 */
export function useRemoveProject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: ProjectRemoveInput) => api.projects.remove(input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects })
      qc.removeQueries({ queryKey: queryKeys.project(id) })
    },
  })
}
