import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches the content of a single file by its relative path.
 */
export function useFileContentQuery(filePath: string | undefined) {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.fileContent(filePath ?? ''),
    queryFn: () => api.files.content(projectId!, filePath!),
    enabled: !!projectId && !!filePath,
  })
}
