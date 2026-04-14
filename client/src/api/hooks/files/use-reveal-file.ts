import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Reveals a file in the OS file manager (Finder / Explorer).
 */
export function useRevealFile() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (path: string) => api.files.reveal(projectId!, path),
  })
}
