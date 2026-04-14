import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Saves content to a file. Invalidates the file content cache on success.
 */
export function useSaveFile() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      api.files.save(projectId!, path, content),
    onSuccess: (_data, { path }) => {
      qc.invalidateQueries({ queryKey: keys.fileContent(path) })
      qc.invalidateQueries({ queryKey: keys.files })
    },
  })
}
