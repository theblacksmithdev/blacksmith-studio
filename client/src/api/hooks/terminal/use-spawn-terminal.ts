import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Spawns a new terminal shell in the project directory.
 */
export function useSpawnTerminal() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (opts?: { cwd?: string; cols?: number; rows?: number }) =>
      api.terminal.spawn({ projectId: projectId!, ...opts }),
  })
}
