import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Stops a runner service. Pass configId for a single service, omit for all.
 */
export function useStopRunner() {
  const projectId = useActiveProjectId()

  return useMutation({
    mutationFn: (configId?: string) => api.runner.stop(projectId!, configId),
  })
}
