import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Opens a file in an external code editor.
 */
export function useOpenInEditor() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: ({ path, command }: { path: string; command?: string }) =>
      api.files.openInEditor(projectId!, path, command),
  })
}
