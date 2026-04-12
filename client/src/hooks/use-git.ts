import { useEffect, useCallback, useMemo } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { useGitStore } from '@/stores/git-store'
import { useProjectKeys } from './use-project-keys'

/**
 * Initializes IPC listener for git status changes and syncs initial state.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const store = useGitStore

  useEffect(() => {
    api.git.status().then((status) => {
      store.getState().setStatus(status as any)
    }).catch(() => {})

    const unsub = api.git.onStatusChange((data) => {
      store.getState().setStatus(data as any)
    })

    return () => unsub()
  }, [])
}

/**
 * React Query hooks + mutation actions for git operations.
 */
export function useGit() {
  const qc = useQueryClient()
  const keys = useProjectKeys()

  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: keys.gitStatus })
    qc.invalidateQueries({ queryKey: keys.gitChangedFiles })
    qc.invalidateQueries({ queryKey: keys.gitHistory })
    qc.invalidateQueries({ queryKey: keys.gitBranches })
    qc.invalidateQueries({ queryKey: keys.gitSyncStatus })
  }, [qc, keys])

  const commit = useMutation({
    mutationFn: api.git.commit,
    onSuccess: () => {
      invalidateAll()
      api.git.status().then((s) => useGitStore.getState().setStatus(s as any)).catch(() => {})
    },
  })

  const generateMessage = useMutation({
    mutationFn: () => api.git.generateMessage(),
  })

  const createBranch = useMutation({
    mutationFn: api.git.createBranch,
    onSuccess: invalidateAll,
  })

  const switchBranch = useMutation({
    mutationFn: api.git.switchBranch,
    onSuccess: invalidateAll,
  })

  const merge = useMutation({
    mutationFn: api.git.merge,
    onSuccess: invalidateAll,
  })

  const sync = useMutation({
    mutationFn: () => api.git.sync(),
    onSuccess: invalidateAll,
  })

  const initGit = useMutation({
    mutationFn: () => api.git.init(),
    onSuccess: invalidateAll,
  })

  const resolveConflict = useMutation({
    mutationFn: api.git.resolveConflict,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.gitConflicts })
      qc.invalidateQueries({ queryKey: keys.gitChangedFiles })
    },
  })

  return {
    commit,
    generateMessage,
    createBranch,
    switchBranch,
    merge,
    sync,
    initGit,
    resolveConflict,
    invalidateAll,
  }
}

/* ── Standalone query hooks ── */
/* All use the default staleTime (30s) from query-client unless overridden */

export function useGitStatus() {
  const keys = useProjectKeys()
  return useQuery({
    queryKey: keys.gitStatus,
    queryFn: () => api.git.status(),
  })
}

const CHANGED_FILES_PAGE_SIZE = 100

export function useGitChangedFiles() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)

  const query = useInfiniteQuery({
    queryKey: keys.gitChangedFiles,
    queryFn: ({ pageParam = 0 }) => api.git.changedFiles({ limit: CHANGED_FILES_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + CHANGED_FILES_PAGE_SIZE : undefined,
    enabled: initialized,
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

export function useGitHistory(limit?: number) {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: keys.gitHistory,
    queryFn: () => api.git.history(limit ? { limit } : undefined),
    enabled: initialized,
  })
}

export function useGitBranches() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: keys.gitBranches,
    queryFn: () => api.git.listBranches(),
    enabled: initialized,
  })
}

export function useGitSyncStatus() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: keys.gitSyncStatus,
    queryFn: () => api.git.syncStatus(),
    enabled: initialized,
    staleTime: 60_000,
  })
}

export function useGitConflicts() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: keys.gitConflicts,
    queryFn: () => api.git.conflicts(),
    enabled: initialized,
  })
}

export function useGitCommitDetail(hash: string) {
  const keys = useProjectKeys()
  return useQuery({
    queryKey: keys.gitCommitDetail(hash),
    queryFn: () => api.git.commitDetail({ hash }),
    enabled: !!hash,
    staleTime: Infinity,
  })
}

export function useGitDiff(filePath?: string) {
  const keys = useProjectKeys()
  return useQuery({
    queryKey: keys.gitDiff(filePath ?? ''),
    queryFn: () => api.git.diff({ path: filePath! }),
    enabled: !!filePath,
    staleTime: 5_000,
  })
}
