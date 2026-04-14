import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Deletes a file or directory. Invalidates the file tree on success.
 */
export function useDeleteFile() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (path: string) => api.files.delete(projectId!, path),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.files })
    },
  })
}
