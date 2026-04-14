import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys } from '../_shared'

/**
 * Fetches a single session by ID, including its messages.
 */
export function useSessionQuery(id: string | undefined) {
  const keys = useProjectKeys()

  return useQuery({
    queryKey: keys.session(id ?? ''),
    queryFn: () => api.sessions.get({ id: id! }),
    enabled: !!id,
  })
}
