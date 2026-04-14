import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useActiveProjectId } from '../_shared'

/**
 * Checks setup status — Node.js, Claude CLI installation, and auth.
 * Optionally scoped to a project if inside a project route.
 */
export function useSetupCheckQuery() {
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: ['setup', 'check', projectId] as const,
    queryFn: () => api.setup.check(projectId),
  })
}
