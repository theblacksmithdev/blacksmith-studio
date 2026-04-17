export { GitManager } from "./git-manager.js";
export { GitClient, type IGitClient } from "./git-client.js";
export { GitEventBus } from "./event-bus.js";
export { GitWatcher } from "./watcher.js";
export { DiffFormatter } from "./diff-formatter.js";
export type {
  GitStatus,
  ChangedFile,
  CommitEntry,
  CommitFile,
  CommitDetail,
  BranchInfo,
  SyncStatus,
  ConflictFile,
  FileStatus,
  SyncState,
  SyncResolution,
  GitStatusListener,
} from "./types.js";
export {
  StatusService,
  FilesService,
  CommitService,
  CommitMessageGenerator,
  BranchService,
  SyncService,
  ConflictService,
  RepoLifecycleService,
  type MergeResult,
  type SyncResult,
  type ConflictResolution,
} from "./services/index.js";
