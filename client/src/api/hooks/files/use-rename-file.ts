import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Renames a file or directory. Invalidates the file tree on success.
 */
export function useRenameFile() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: ({ path, newName }: { path: string; newName: string }) =>
      api.files.rename(projectId!, path, newName),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.files })
    },
  })
}
