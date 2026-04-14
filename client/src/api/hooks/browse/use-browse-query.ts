import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import type { BrowseResult } from '@/api/types'

/**
 * Browses a directory on disk and returns its subdirectories.
 * Pass `undefined` to browse the home directory.
 * Pass `null` to disable the query (not started).
 */
export function useBrowseQuery(path: string | null | undefined) {
  return useQuery<BrowseResult>({
    queryKey: queryKeys.browse(path ?? undefined),
    queryFn: () => api.browse.list(path != null ? { path } : undefined),
    enabled: path !== null,
  })
}
