import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import type { BrowseResult } from './types'

export function useBrowse() {
  // null = not started, undefined = home directory, string = specific path
  const [currentPath, setCurrentPath] = useState<string | null>(null)

  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.browse(currentPath ?? undefined),
    queryFn: () => api.browse.list(currentPath != null ? { path: currentPath } : undefined),
    enabled: currentPath !== null,
  })

  const browse = useCallback((dirPath?: string) => {
    setCurrentPath(dirPath ?? '')
  }, [])

  return { data: (data as BrowseResult | undefined) ?? null, loading, browse }
}
