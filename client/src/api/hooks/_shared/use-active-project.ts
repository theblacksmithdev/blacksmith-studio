import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'

/**
 * Fetches the active project from the backend using the :projectId route param.
 * Returns the query result — use `.data` for the project object.
 */
export function useActiveProject() {
  const { projectId } = useParams<{ projectId: string }>()

  return useQuery({
    queryKey: queryKeys.project(projectId ?? ''),
    queryFn: () => api.projects.get({ id: projectId! }),
    enabled: !!projectId,
  })
}
