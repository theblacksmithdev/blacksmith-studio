import type { Ai } from "../ai/ai.js";
import type { PaginationInput, PaginatedResult } from "../../types.js";
import { GitClient } from "./git-client.js";
import { GitEventBus } from "./event-bus.js";
import { GitWatcher } from "./watcher.js";
import {
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
import type {
  BranchInfo,
  ChangedFile,
  CommitDetail,
  CommitEntry,
  ConflictFile,
  GitStatus,
  GitStatusListener,
  SyncStatus,
} from "./types.js";

/**
 * Facade over the git services.
 *
 * Single Responsibility: composition + delegation. No git logic lives
 * here — every method routes to exactly one service.
 *
 * Public API is preserved byte-for-byte with the pre-refactor GitManager
 * so IPC handlers and other consumers don't need to change.
 */
export class GitManager {
  private readonly bus: GitEventBus;
  private readonly watcher: GitWatcher;

  private readonly client: GitClient;
  private readonly status: StatusService;
  private readonly files: FilesService;
  private readonly commits: CommitService;
  private readonly messages: CommitMessageGenerator;
  private readonly branches: BranchService;
  private readonly syncer: SyncService;
  private readonly conflicts: ConflictService;

  constructor(client: GitClient = new GitClient()) {
    this.bus = new GitEventBus();
    this.watcher = new GitWatcher(this.bus);
    this.client = client;

    this.status = new StatusService(client);
    this.files = new FilesService(client);
    this.commits = new CommitService(client, this.bus);
    this.messages = new CommitMessageGenerator(client);
    this.branches = new BranchService(client, this.bus);
    this.syncer = new SyncService(client, this.bus);
    this.conflicts = new ConflictService(client, this.bus);
  }

  /* ── Status ── */

  getStatus(projectPath: string): Promise<GitStatus> {
    return this.status.getStatus(projectPath);
  }

  getSyncStatus(projectPath: string): Promise<SyncStatus> {
    return this.status.getSyncStatus(projectPath);
  }

  /* ── Files ── */

  getChangedFiles(
    projectPath: string,
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<ChangedFile>> {
    return this.files.getChangedFiles(projectPath, pagination);
  }

  getDiff(projectPath: string, filePath: string): Promise<string> {
    return this.files.getDiff(projectPath, filePath);
  }

  /* ── Commits ── */

  commit(
    projectPath: string,
    message: string,
    files?: string[],
  ): Promise<string> {
    return this.commits.commit(projectPath, message, files);
  }

  generateMessage(projectPath: string, ai?: Ai): Promise<string> {
    return this.messages.generate(projectPath, ai);
  }

  getHistory(projectPath: string, limit = 50): Promise<CommitEntry[]> {
    return this.commits.getHistory(projectPath, limit);
  }

  getCommitDetail(projectPath: string, hash: string): Promise<CommitDetail> {
    return this.commits.getCommitDetail(projectPath, hash);
  }

  /* ── Branches ── */

  listBranches(projectPath: string): Promise<BranchInfo[]> {
    return this.branches.list(projectPath);
  }

  createBranch(projectPath: string, name: string): Promise<void> {
    return this.branches.create(projectPath, name);
  }

  switchBranch(projectPath: string, name: string): Promise<void> {
    return this.branches.switch(projectPath, name);
  }

  merge(
    projectPath: string,
    source: string,
    target: string,
  ): Promise<MergeResult> {
    return this.branches.merge(projectPath, source, target);
  }

  /* ── Sync ── */

  sync(projectPath: string): Promise<SyncResult> {
    return this.syncer.sync(projectPath);
  }

  /* ── Conflicts ── */

  getConflicts(projectPath: string): Promise<ConflictFile[]> {
    return this.conflicts.list(projectPath);
  }

  resolveConflict(
    projectPath: string,
    filePath: string,
    resolution: ConflictResolution,
  ): Promise<void> {
    return this.conflicts.resolve(projectPath, filePath, resolution);
  }

  /* ── Lifecycle ── */

  async init(projectPath: string): Promise<void> {
    const git = this.client.of(projectPath);
    await git.init();
    await git.add(".");
    await git.commit("Initial project setup");
    this.bus.emitStatusChange(projectPath);
  }

  /* ── Events ── */

  onStatusChange(listener: GitStatusListener): () => void {
    return this.bus.onStatusChange(listener);
  }

  /* ── Watching ── */

  startWatching(projectPath: string): void {
    this.watcher.start(projectPath);
  }

  stopWatching(projectPath: string): void {
    this.watcher.stop(projectPath);
  }

  stopAllWatching(): void {
    this.watcher.stopAll();
  }
}
