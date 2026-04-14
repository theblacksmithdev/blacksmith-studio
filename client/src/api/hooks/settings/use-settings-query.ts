import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

/**
 * Fetches all project-scoped settings for the active project.
 */
export function useSettingsQuery() {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  return useQuery({
    queryKey: keys.settings,
    queryFn: () => api.settings.getAll(projectId!),
    enabled: !!projectId,
  })
}
