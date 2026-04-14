import { api as raw } from '../client'
import type {
  GitStatusResult,
  GitChangedFile,
  GitCommitEntry,
  GitBranchInfo,
  GitSyncStatus,
  GitConflictFile,
  GitCommitInput,
  GitHistoryInput,
  GitDiffInput,
  GitCreateBranchInput,
  GitSwitchBranchInput,
  GitMergeInput,
  GitMergeResult,
  GitSyncResult,
  GitResolveConflictInput,
  GitCommitDetail,
  GitCommitDetailInput,
  PaginationInput,
  PaginatedResult,
} from '../types'

export const git = {
  // Status
  status: (projectId: string) => raw.invoke<GitStatusResult>('git:status', { projectId }),
  changedFiles: (projectId: string, input?: PaginationInput) => raw.invoke<PaginatedResult<GitChangedFile>>('git:changedFiles', { projectId, ...input }),
  diff: (projectId: string, input: GitDiffInput) => raw.invoke<string>('git:diff', { projectId, ...input }),

  // Commits
  commit: (projectId: string, input: GitCommitInput) => raw.invoke<string>('git:createCheckpoint', { projectId, ...input }),
  generateMessage: (projectId: string) => raw.invoke<string>('git:generateMessage', { projectId }),
  history: (projectId: string, input?: GitHistoryInput) => raw.invoke<GitCommitEntry[]>('git:history', { projectId, ...input }),
  commitDetail: (projectId: string, input: GitCommitDetailInput) => raw.invoke<GitCommitDetail>('git:commitDetail', { projectId, ...input }),

  // Branches
  listBranches: (projectId: string) => raw.invoke<GitBranchInfo[]>('git:listVersions', { projectId }),
  createBranch: (projectId: string, input: GitCreateBranchInput) => raw.invoke<void>('git:createVersion', { projectId, ...input }),
  switchBranch: (projectId: string, input: GitSwitchBranchInput) => raw.invoke<void>('git:switchVersion', { projectId, ...input }),
  merge: (projectId: string, input: GitMergeInput) => raw.invoke<GitMergeResult>('git:applyVersion', { projectId, ...input }),

  // Push / Pull
  sync: (projectId: string) => raw.invoke<GitSyncResult>('git:sync', { projectId }),
  syncStatus: (projectId: string) => raw.invoke<GitSyncStatus>('git:syncStatus', { projectId }),

  // Conflicts
  conflicts: (projectId: string) => raw.invoke<GitConflictFile[]>('git:conflicts', { projectId }),
  resolveConflict: (projectId: string, input: GitResolveConflictInput) => raw.invoke<void>('git:resolveConflict', { projectId, ...input }),

  // Init
  init: (projectId: string) => raw.invoke<void>('git:init', { projectId }),

  // Subscribe
  onStatusChange: (cb: (data: GitStatusResult) => void) => raw.subscribe('git:onStatusChange', cb),
} as const
