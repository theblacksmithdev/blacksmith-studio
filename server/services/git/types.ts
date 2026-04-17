export type SyncState =
  | "synced"
  | "ahead"
  | "behind"
  | "diverged"
  | "local-only"
  | "unknown";

export type FileStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked";

export interface GitStatus {
  initialized: boolean;
  branch: string;
  changedCount: number;
  syncStatus: SyncState;
  ahead: number;
  behind: number;
}

export interface ChangedFile {
  path: string;
  status: FileStatus;
  staged: boolean;
}

export interface CommitEntry {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}

export interface CommitFile {
  path: string;
  status: string;
  insertions: number;
  deletions: number;
}

export interface CommitDetail {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: CommitFile[];
  diff: string;
}

export interface BranchInfo {
  name: string;
  current: boolean;
  label: string;
}

export interface SyncStatus {
  ahead: number;
  behind: number;
  hasRemote: boolean;
}

export interface ConflictFile {
  path: string;
}

export interface SyncResolution {
  status: SyncState;
  ahead: number;
  behind: number;
}

export type GitStatusListener = (projectPath: string) => void;
