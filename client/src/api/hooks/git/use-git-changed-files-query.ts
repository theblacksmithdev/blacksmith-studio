import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '@/api'
import { useProjectKeys, useActiveProjectId } from '../_shared'

const PAGE_SIZE = 100

/**
 * Fetches changed files with infinite pagination.
 */
export function useGitChangedFilesQuery() {
  const keys = useProjectKeys()
  const projectId = useActiveProjectId()

  const query = useInfiniteQuery({
    queryKey: keys.gitChangedFiles,
    queryFn: ({ pageParam = 0 }) =>
      api.git.changedFiles(projectId!, { limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + PAGE_SIZE : undefined,
    enabled: !!projectId,
  })

  const files = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  )
  const total = query.data?.pages[0]?.total ?? 0

  return {
    data: files,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  }
}
