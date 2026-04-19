export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  lastOpenedAt: string;
}
import type {
  Session,
  SessionSummary,
  FileNode,
  PromptTemplate,
  HealthStatus,
} from "@/types";

/* ── AI ── */

/** One model offered by the active AI provider. */
export interface AiModelOption {
  value: string;
  label: string;
  description: string;
}

/* ── Pagination ── */

export interface PaginationInput {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

/* ── Projects ── */

export interface ProjectGetInput {
  id: string;
}
export interface ProjectRegisterInput {
  path: string;
  name?: string;
}
export interface ProjectCreateInput {
  name: string;
  parentPath: string;
  ai: boolean;
  backendPort?: number;
  frontendPort?: number;
  theme?: string;
}
export interface ProjectRenameInput {
  id: string;
  name: string;
}
export interface ProjectRemoveInput {
  id: string;
  hard?: boolean;
}
export interface ProjectCloneInput {
  gitUrl: string;
  parentPath: string;
  name?: string;
}
export interface ProjectValidateInput {
  path: string;
}
export interface ProjectValidateResult {
  valid: boolean;
  path: string;
  name: string;
  isBlacksmithProject: boolean;
  hasPackageJson: boolean;
  hasGit: boolean;
}

// Subscribe events
export interface ProjectCreateOutputEvent {
  line: string;
}
export interface ProjectCreateDoneEvent {
  project: { id: string };
}
export interface ProjectCreateErrorEvent {
  error: string;
}

/* ── Browse ── */

export interface BrowseInput {
  path?: string;
}
export interface BrowseResult {
  current: string;
  parent: string;
  dirs: { name: string; path: string }[];
  isProject: boolean;
  isBlacksmithProject: boolean;
}

/* ── Sessions ── */

export interface SessionListInput {
  limit?: number;
  offset?: number;
}
export interface PaginatedSessions {
  items: SessionSummary[];
  total: number;
}
export interface SessionCreateInput {
  name?: string;
}
export interface SessionGetInput {
  id: string;
}
export interface SessionRenameInput {
  id: string;
  name: string;
}
export interface SessionDeleteInput {
  id: string;
}

/* ── Files ── */

export interface FileContentInput {
  path: string;
}
export interface FileContentResult {
  content: string;
  language: string;
  size: number;
}

// Subscribe events
export interface FilesChangedEvent {
  paths: string[];
}

/* ── Templates ── */

export interface TemplateInterpolateInput {
  templateId: string;
  values: Record<string, string>;
}
export interface TemplateInterpolateResult {
  prompt: string;
}

/* ── Settings ── */

export type SettingsMap = Record<string, any>;

/* ── Runner ── */

export interface RunnerServiceStatus {
  id: string;
  name: string;
  status: "stopped" | "starting" | "running";
  port: number | null;
  previewUrl: string | null;
  icon: string;
}

export interface RunnerConfigData {
  id: string;
  projectId: string;
  name: string;
  command: string;
  setupCommand: string | null;
  cwd: string;
  port: number | null;
  portArg: string | null;
  env: Record<string, string>;
  readyPattern: string | null;
  previewUrl: string | null;
  icon: string;
  sortOrder: number;
  autoDetected: boolean;
}

export interface NodeInstallation {
  label: string;
  path: string;
  version: string;
}

// Subscribe events
export interface RunnerOutputEvent {
  projectId: string;
  configId: string;
  name: string;
  line: string;
  timestamp: number;
}

export interface RunnerStatusEvent {
  projectId: string;
  services: RunnerServiceStatus[];
}

/* ── Claude ── */

export interface ClaudePromptInput {
  sessionId: string;
  prompt: string;
}
export interface ClaudeCancelInput {
  sessionId: string;
}

// Subscribe events
export interface ClaudeMessageEvent {
  sessionId: string;
  content: string;
  isPartial: boolean;
}
export interface ClaudeToolUseEvent {
  sessionId: string;
  toolId: string;
  toolName: string;
  input: Record<string, unknown>;
}
export interface ClaudeDoneEvent {
  sessionId: string;
  costUsd: number;
  durationMs: number;
}
export interface ClaudeErrorEvent {
  sessionId: string;
  error: string;
  code: string;
}

/* ── Git ── */

export interface GitStatusResult {
  initialized: boolean;
  branch: string;
  changedCount: number;
  syncStatus:
    | "synced"
    | "ahead"
    | "behind"
    | "diverged"
    | "local-only"
    | "unknown";
  ahead: number;
  behind: number;
}

export interface GitChangedFile {
  path: string;
  status: "modified" | "added" | "deleted" | "renamed" | "untracked";
  staged: boolean;
}

export interface GitCommitEntry {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
}

export interface GitBranchInfo {
  name: string;
  current: boolean;
  label: string;
}

export interface GitSyncStatus {
  ahead: number;
  behind: number;
  hasRemote: boolean;
}

export interface GitConflictFile {
  path: string;
}

export interface GitCommitDetail {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: {
    path: string;
    status: string;
    insertions: number;
    deletions: number;
  }[];
  diff: string;
}

export interface GitCommitDetailInput {
  hash: string;
}
export interface GitCommitInput {
  message: string;
  files?: string[];
}
export interface GitHistoryInput {
  limit?: number;
}
export interface GitDiffInput {
  path: string;
}
export interface GitCreateBranchInput {
  name: string;
}
export interface GitSwitchBranchInput {
  name: string;
}
export interface GitMergeInput {
  source: string;
  target: string;
}
export interface GitMergeResult {
  success: boolean;
  conflicts: string[];
}
export interface GitSyncResult {
  success: boolean;
  error?: string;
}
export interface GitResolveConflictInput {
  path: string;
  resolution: "ours" | "theirs";
}

/* ── Agents ── */

export type AgentRole =
  | "frontend-engineer"
  | "backend-engineer"
  | "fullstack-engineer"
  | "devops-engineer"
  | "qa-engineer"
  | "security-engineer"
  | "database-engineer"
  | "ui-designer"
  | "technical-writer"
  | "code-reviewer"
  | "architect"
  | "product-manager";

export type AgentTeam =
  | "product"
  | "architecture"
  | "engineering"
  | "quality"
  | "documentation";

export interface AgentTeamDefinition {
  team: AgentTeam;
  title: string;
  description: string;
  roles: AgentRole[];
}

export const AGENT_TEAMS: AgentTeamDefinition[] = [
  {
    team: "product",
    title: "Product & Strategy",
    description: "The decision-maker and requirement owner. Drives priorities.",
    roles: ["product-manager"],
  },
  {
    team: "architecture",
    title: "Architecture & Infrastructure",
    description: "System design, data layer, and deployment pipeline.",
    roles: ["architect", "database-engineer", "devops-engineer"],
  },
  {
    team: "engineering",
    title: "Engineering",
    description:
      "The core builders — backend, frontend, design, and fullstack.",
    roles: [
      "backend-engineer",
      "frontend-engineer",
      "fullstack-engineer",
      "ui-designer",
    ],
  },
  {
    team: "quality",
    title: "Quality & Assurance",
    description: "Reviews correctness, security, and test coverage.",
    roles: ["qa-engineer", "code-reviewer", "security-engineer"],
  },
  {
    team: "documentation",
    title: "Documentation",
    description: "Technical docs, API references, and developer guides.",
    roles: ["technical-writer"],
  },
];

export type AgentStatus =
  | "idle"
  | "thinking"
  | "executing"
  | "paused"
  | "error"
  | "done";

export interface AgentInfo {
  role: AgentRole;
  title: string;
  description: string;
  isRunning: boolean;
}

export interface AgentRouteResult {
  role: AgentRole;
  confidence: "high" | "medium" | "low";
}

export interface AgentExecution {
  id: string;
  agentId: string;
  sessionId: string;
  status: AgentStatus;
  prompt: string;
  startedAt: string;
  completedAt: string | null;
  costUsd: number;
  durationMs: number;
  error: string | null;
}

export type AgentEventType =
  | "status"
  | "message"
  | "tool_use"
  | "tool_result"
  | "thinking"
  | "error"
  | "done"
  | "handoff"
  | "activity"
  | "task_status"
  | "subtask_status"
  | "dispatch_plan";

export interface AgentEvent {
  type: AgentEventType;
  agentId: string;
  executionId: string;
  timestamp: string;
  data: Record<string, any>;
}

export type TaskModel = "fast" | "balanced" | "premium";
export type ReviewLevel = "none" | "light" | "full";

export interface DispatchTask {
  id: string;
  title: string;
  description: string;
  role: AgentRole;
  prompt: string;
  dependsOn: string[];
  /** AI model selected by PM based on task complexity */
  model: TaskModel;
  /** How much quality gate scrutiny this task receives */
  reviewLevel: ReviewLevel;
  /** Client-side tracking */
  status?: "pending" | "running" | "done" | "error" | "skipped";
}

export interface DispatchPlan {
  mode: "single" | "multi" | "clarification";
  task?: DispatchTask;
  tasks: DispatchTask[];
  summary: string;
}

export interface DispatchResult {
  plan: DispatchPlan;
  executions: AgentExecution[];
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  steps: {
    role: AgentRole;
    promptTemplate: string;
    dependsOn: number | null;
  }[];
}

export interface WorkflowEvent {
  type: string;
  workflowId: string;
  stepIndex: number | null;
  timestamp: string;
  data: Record<string, any>;
}

export interface BuildEvent {
  type: string;
  buildId: string;
  timestamp: string;
  phaseIndex?: number;
  taskId?: string;
  data: Record<string, any>;
}

export interface InputRequest {
  id: string;
  type: "approve" | "choose" | "text";
  question: string;
  context?: string;
  options?: { value: string; label: string }[];
  defaultValue: string;
  source: { buildId: string; phaseIndex?: number; taskId?: string };
  timestamp: string;
}

/* ── Conversation Events (unified log across single + multi-agent chats) ── */

export type EventScope = "single_chat" | "agent_chat";

export type ConversationEventType =
  | "user_message"
  | "assistant_message"
  | "tool_use"
  | "tool_result"
  | "thinking_block"
  | "dispatch_created"
  | "dispatch_plan"
  | "dispatch_status"
  | "task_created"
  | "task_status_change"
  | "task_result"
  | "agent_activity"
  | "command_executed"
  | "error";

export interface ConversationEvent {
  id: string;
  projectId: string;
  scope: EventScope;
  conversationId: string;
  dispatchId: string | null;
  taskId: string | null;
  messageId: string | null;
  agentRole: string | null;
  eventType: ConversationEventType;
  payload: unknown;
  sequence: number;
  timestamp: string;
}

export interface ConversationEventsListInput {
  scope: EventScope;
  conversationId: string;
  afterSequence?: number;
  limit?: number;
}

/* ── Agent Tasks (DB-backed) ── */

export type AgentTaskStatus =
  | "pending"
  | "running"
  | "done"
  | "error"
  | "skipped";

export interface AgentTask {
  id: string;
  dispatchId: string;
  title: string;
  description: string | null;
  role: AgentRole;
  prompt: string;
  status: AgentTaskStatus;
  taskType: "main" | "subtask" | "bugfix" | null;
  parentTaskId: string | null;
  orderIndex: number;
  executionId: string | null;
  sessionId: string | null;
  responseText: string | null;
  error: string | null;
  costUsd: string | null;
  durationMs: number | null;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

export interface TaskNote {
  id: string;
  taskId: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

/* ── Artifacts (markdown outputs under .blacksmith/artifacts/) ── */

export interface Artifact {
  id: string;
  projectId: string;
  conversationId: string | null;
  dispatchId: string | null;
  taskId: string | null;
  role: string;
  slug: string;
  title: string;
  relPath: string;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactContent {
  artifact: Artifact;
  content: string;
}

export interface ArtifactsListInput {
  projectId: string;
  conversationId?: string;
  role?: string;
  tag?: string;
  search?: string;
  limit?: number;
}

export interface ArtifactCreateInput {
  projectId: string;
  role: string;
  title: string;
  content: string;
  conversationId?: string;
  dispatchId?: string;
  taskId?: string;
  tags?: string[];
}

export type ArtifactChange =
  | { kind: "upsert"; artifact: Artifact }
  | { kind: "delete"; id: string; projectId: string };

/* ── Commands (unified subprocess execution) ── */

export type CommandScope = "studio" | "project";

export type CommandStatus =
  | "running"
  | "done"
  | "error"
  | "cancelled"
  | "timeout";

export interface CommandSpec {
  scope: CommandScope;
  projectId: string;
  preset?: string;
  command?: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  description?: string;
  conversationId?: string;
  taskId?: string;
  agentRole?: string;
}

export interface CommandResult {
  runId: string;
  status: CommandStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  toolchainId: string;
  resolvedEnvDisplay: string | null;
}

export interface CommandOutputChunk {
  runId: string;
  stream: "stdout" | "stderr";
  chunk: string;
}

export interface CommandStatusChange {
  runId: string;
  status: CommandStatus;
  exitCode: number | null;
  durationMs: number | null;
}

export interface ToolchainInfo {
  id: string;
  displayName: string;
  presetOwnership: readonly string[];
  binaries: readonly string[];
  /** True when the backend toolchain implements `EnvCreatingToolchain` —
   *  the inspector UI renders a "Set up" button for these. */
  supportsProjectEnvCreation: boolean;
  /** True when the backend toolchain implements `EnvDeletingToolchain` —
   *  the inspector UI renders a "Reset" button for these. */
  supportsProjectEnvDeletion: boolean;
  /** True when the backend toolchain can list installed interpreters —
   *  the inspector UI renders a "Change" picker for these. */
  supportsListInstalledVersions: boolean;
}

export interface InstalledVersion {
  displayName: string;
  path: string;
  version: string;
  source:
    | "default"
    | "pyenv"
    | "conda"
    | "system"
    | "nvm"
    | "fnm"
    | "other";
}

export interface ToolchainEnv {
  scope: CommandScope;
  toolchainId: string;
  displayName: string;
  root: string;
  bin: string;
  envVars: Record<string, string>;
  invoker?: { command: string; args: string[] };
}

export interface CommandRunRecord {
  id: string;
  projectId: string;
  conversationId: string | null;
  taskId: string | null;
  agentRole: string | null;
  toolchainId: string;
  preset: string | null;
  scope: CommandScope;
  command: string;
  args: string;
  cwd: string;
  resolvedEnvDisplay: string | null;
  exitCode: number | null;
  stdout: string | null;
  stderr: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  status: CommandStatus;
}

export interface CommandErrorShape {
  error: { code: string; message: string; hint?: string };
}

/* ── Re-exports for convenience ── */

export type { Session, SessionSummary, FileNode, PromptTemplate, HealthStatus };
