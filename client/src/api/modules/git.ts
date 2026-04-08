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
} from '../types'

export const git = {
  // Status
  status: () => raw.invoke<GitStatusResult>('git:status'),
  changedFiles: () => raw.invoke<GitChangedFile[]>('git:changedFiles'),
  diff: (input: GitDiffInput) => raw.invoke<string>('git:diff', input),

  // Commits
  commit: (input: GitCommitInput) => raw.invoke<string>('git:createCheckpoint', input),
  generateMessage: () => raw.invoke<string>('git:generateMessage'),
  history: (input?: GitHistoryInput) => raw.invoke<GitCommitEntry[]>('git:history', input),
  commitDetail: (input: GitCommitDetailInput) => raw.invoke<GitCommitDetail>('git:commitDetail', input),

  // Branches
  listBranches: () => raw.invoke<GitBranchInfo[]>('git:listVersions'),
  createBranch: (input: GitCreateBranchInput) => raw.invoke<void>('git:createVersion', input),
  switchBranch: (input: GitSwitchBranchInput) => raw.invoke<void>('git:switchVersion', input),
  merge: (input: GitMergeInput) => raw.invoke<GitMergeResult>('git:applyVersion', input),

  // Push / Pull
  sync: () => raw.invoke<GitSyncResult>('git:sync'),
  syncStatus: () => raw.invoke<GitSyncStatus>('git:syncStatus'),

  // Conflicts
  conflicts: () => raw.invoke<GitConflictFile[]>('git:conflicts'),
  resolveConflict: (input: GitResolveConflictInput) => raw.invoke<void>('git:resolveConflict', input),

  // Init
  init: () => raw.invoke<void>('git:init'),

  // Subscribe
  onStatusChange: (cb: (data: GitStatusResult) => void) => raw.subscribe('git:onStatusChange', cb),
} as const
