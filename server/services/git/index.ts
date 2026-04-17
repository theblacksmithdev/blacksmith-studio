export { GitManager } from "./git-manager.js";
export { GitClient } from "./git-client.js";
export { GitEventBus } from "./event-bus.js";
export { GitWatcher } from "./watcher.js";
export { capDiff, asAllAdditionsDiff } from "./diff-formatter.js";
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
  type MergeResult,
  type SyncResult,
  type ConflictResolution,
} from "./services/index.js";
