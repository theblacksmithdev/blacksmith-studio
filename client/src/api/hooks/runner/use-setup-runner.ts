import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Runs the setup step (e.g. npm install) for a runner config.
 */
export function useSetupRunner() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (configId: string) => api.runner.setup(projectId!, configId),
  })
}
