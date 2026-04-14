import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'

/**
 * Validates a directory path as a potential project.
 * Only runs when a non-empty path is provided.
 */
export function useValidateProject(path: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projectValidation(path ?? ''),
    queryFn: () => api.projects.validate({ path: path! }),
    enabled: !!path,
  })
}
