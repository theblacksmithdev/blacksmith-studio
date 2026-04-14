import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

/**
 * Checks setup status — Node.js, Claude CLI installation, and auth.
 */
export function useSetupCheckQuery() {
  return useQuery({
    queryKey: ['setup', 'check'] as const,
    queryFn: () => api.setup.check(),
  })
}
