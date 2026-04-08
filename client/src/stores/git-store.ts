import { create } from 'zustand'

export type SyncStatus = 'synced' | 'ahead' | 'behind' | 'diverged' | 'local-only' | 'unknown'

interface GitState {
  initialized: boolean
  branch: string
  changedCount: number
  syncStatus: SyncStatus
  ahead: number
  behind: number

  setStatus: (status: {
    initialized: boolean
    branch: string
    changedCount: number
    syncStatus: SyncStatus
    ahead: number
    behind: number
  }) => void
}

export const useGitStore = create<GitState>((set) => ({
  initialized: false,
  branch: '',
  changedCount: 0,
  syncStatus: 'unknown',
  ahead: 0,
  behind: 0,

  setStatus: (status) => set(status),
}))

/* ── Selectors ── */

export const selectBranchLabel = (s: GitState) => s.branch || 'HEAD'

export const selectHasChanges = (s: GitState) => s.changedCount > 0
