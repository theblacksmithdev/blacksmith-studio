import { useEffect, useCallback, useMemo } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '@/api'
import { useGitStore } from '@/stores/git-store'
import { useProjectKeys } from './use-project-keys'

/**
 * Initializes IPC listener for git status changes and syncs initial state.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const store = useGitStore
  const { projectId } = useParams<{ projectId: string }>()

  useEffect(() => {
    if (!projectId) return

    api.git.status(projectId).then((status) => {
      store.getState().setStatus(status as any)
    }).catch(() => {})

    const unsub = api.git.onStatusChange((data) => {
      store.getState().setStatus(data as any)
    })

    return () => unsub()
  }, [projectId])
}

/**
 * React Query hooks + mutation actions for git operations.
 */
export function useGit() {
  const qc = useQueryClient()
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()

  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: keys.gitStatus })
    qc.invalidateQueries({ queryKey: keys.gitChangedFiles })
    qc.invalidateQueries({ queryKey: keys.gitHistory })
    qc.invalidateQueries({ queryKey: keys.gitBranches })
    qc.invalidateQueries({ queryKey: keys.gitSyncStatus })
  }, [qc, keys])

  const commit = useMutation({
    mutationFn: (input: { message: string; files?: string[] }) => api.git.commit(projectId!, input),
    onSuccess: () => {
      invalidateAll()
      api.git.status(projectId!).then((s) => useGitStore.getState().setStatus(s as any)).catch(() => {})
    },
  })

  const generateMessage = useMutation({
    mutationFn: () => api.git.generateMessage(projectId!),
  })

  const createBranch = useMutation({
    mutationFn: (input: { name: string }) => api.git.createBranch(projectId!, input),
    onSuccess: invalidateAll,
  })

  const switchBranch = useMutation({
    mutationFn: (input: { name: string }) => api.git.switchBranch(projectId!, input),
    onSuccess: invalidateAll,
  })

  const merge = useMutation({
    mutationFn: (input: { source: string; target: string }) => api.git.merge(projectId!, input),
    onSuccess: invalidateAll,
  })

  const sync = useMutation({
    mutationFn: () => api.git.sync(projectId!),
    onSuccess: invalidateAll,
  })

  const initGit = useMutation({
    mutationFn: () => api.git.init(projectId!),
    onSuccess: invalidateAll,
  })

  const resolveConflict = useMutation({
    mutationFn: (input: { path: string; resolution: 'ours' | 'theirs' }) => api.git.resolveConflict(projectId!, input),
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
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitStatus,
    queryFn: () => api.git.status(projectId!),
    enabled: !!projectId,
  })
}

const CHANGED_FILES_PAGE_SIZE = 100

export function useGitChangedFiles() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  const { projectId } = useParams<{ projectId: string }>()

  const query = useInfiniteQuery({
    queryKey: keys.gitChangedFiles,
    queryFn: ({ pageParam = 0 }) => api.git.changedFiles(projectId!, { limit: CHANGED_FILES_PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + CHANGED_FILES_PAGE_SIZE : undefined,
    enabled: initialized && !!projectId,
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
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitHistory,
    queryFn: () => api.git.history(projectId!, limit ? { limit } : undefined),
    enabled: initialized && !!projectId,
  })
}

export function useGitBranches() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitBranches,
    queryFn: () => api.git.listBranches(projectId!),
    enabled: initialized && !!projectId,
  })
}

export function useGitSyncStatus() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitSyncStatus,
    queryFn: () => api.git.syncStatus(projectId!),
    enabled: initialized && !!projectId,
    staleTime: 60_000,
  })
}

export function useGitConflicts() {
  const keys = useProjectKeys()
  const initialized = useGitStore((s) => s.initialized)
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitConflicts,
    queryFn: () => api.git.conflicts(projectId!),
    enabled: initialized && !!projectId,
  })
}

export function useGitCommitDetail(hash: string) {
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitCommitDetail(hash),
    queryFn: () => api.git.commitDetail(projectId!, { hash }),
    enabled: !!hash && !!projectId,
    staleTime: Infinity,
  })
}

export function useGitDiff(filePath?: string) {
  const keys = useProjectKeys()
  const { projectId } = useParams<{ projectId: string }>()
  return useQuery({
    queryKey: keys.gitDiff(filePath ?? ''),
    queryFn: () => api.git.diff(projectId!, { path: filePath! }),
    enabled: !!filePath && !!projectId,
    staleTime: 5_000,
  })
}
