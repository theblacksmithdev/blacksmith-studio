import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'
import { queryKeys } from '@/api/query-keys'
import { useGitStore } from '@/stores/git-store'

/**
 * Initializes IPC listener for git status changes and syncs initial state.
 * Mount once at the ProjectLayout level.
 */
export function useGitListener() {
  const store = useGitStore

  useEffect(() => {
    api.git.status().then((status) => {
      store.getState().setStatus(status as any)
    })

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

  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.gitStatus })
    qc.invalidateQueries({ queryKey: queryKeys.gitChangedFiles })
    qc.invalidateQueries({ queryKey: queryKeys.gitHistory })
    qc.invalidateQueries({ queryKey: queryKeys.gitBranches })
    qc.invalidateQueries({ queryKey: queryKeys.gitSyncStatus })
  }, [qc])

  const commit = useMutation({
    mutationFn: api.git.commit,
    onSuccess: () => {
      invalidateAll()
      api.git.status().then((s) => useGitStore.getState().setStatus(s as any))
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
      qc.invalidateQueries({ queryKey: queryKeys.gitConflicts })
      qc.invalidateQueries({ queryKey: queryKeys.gitChangedFiles })
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

export function useGitStatus() {
  return useQuery({
    queryKey: queryKeys.gitStatus,
    queryFn: () => api.git.status(),
  })
}

export function useGitChangedFiles() {
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: queryKeys.gitChangedFiles,
    queryFn: () => api.git.changedFiles(),
    enabled: initialized,
  })
}

export function useGitHistory(limit?: number) {
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: queryKeys.gitHistory,
    queryFn: () => api.git.history(limit ? { limit } : undefined),
    enabled: initialized,
  })
}

export function useGitBranches() {
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: queryKeys.gitBranches,
    queryFn: () => api.git.listBranches(),
    enabled: initialized,
  })
}

export function useGitSyncStatus() {
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: queryKeys.gitSyncStatus,
    queryFn: () => api.git.syncStatus(),
    enabled: initialized,
  })
}

export function useGitConflicts() {
  const initialized = useGitStore((s) => s.initialized)
  return useQuery({
    queryKey: queryKeys.gitConflicts,
    queryFn: () => api.git.conflicts(),
    enabled: initialized,
  })
}
