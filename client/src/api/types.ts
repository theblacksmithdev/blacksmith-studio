import type { Project } from '@/stores/project-store'
import type {
  Session,
  SessionSummary,
  FileNode,
  PromptTemplate,
  HealthStatus,
} from '@/types'

/* ── Pagination ── */

export interface PaginationInput {
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

/* ── Projects ── */

export interface ProjectRegisterInput { path: string; name?: string }
export interface ProjectCreateInput { name: string; parentPath: string; ai: boolean; backendPort?: number; frontendPort?: number; theme?: string }
export interface ProjectActivateInput { id: string }
export interface ProjectRenameInput { id: string; name: string }
export interface ProjectRemoveInput { id: string; hard?: boolean }
export interface ProjectCloneInput { gitUrl: string; parentPath: string; name?: string }
export interface ProjectValidateInput { path: string }
export interface ProjectValidateResult { valid: boolean; path: string; name: string; isBlacksmithProject: boolean; hasPackageJson: boolean; hasGit: boolean }

// Subscribe events
export interface ProjectCreateOutputEvent { line: string }
export interface ProjectCreateDoneEvent { project: { id: string } }
export interface ProjectCreateErrorEvent { error: string }

/* ── Browse ── */

export interface BrowseInput { path?: string }
export interface BrowseEntry { name: string; path: string; type: 'file' | 'directory' }

/* ── Sessions ── */

export interface SessionListInput { limit?: number; offset?: number }
export interface PaginatedSessions { items: SessionSummary[]; total: number }
export interface SessionCreateInput { name?: string }
export interface SessionGetInput { id: string }
export interface SessionRenameInput { id: string; name: string }
export interface SessionDeleteInput { id: string }

/* ── Files ── */

export interface FileContentInput { path: string }
export interface FileContentResult { content: string; language: string; size: number }

// Subscribe events
export interface FilesChangedEvent { paths: string[] }

/* ── Templates ── */

export interface TemplateInterpolateInput { templateId: string; values: Record<string, string> }
export interface TemplateInterpolateResult { prompt: string }

/* ── Settings ── */

export type SettingsMap = Record<string, any>

/* ── Runner ── */

export interface RunnerServiceStatus {
  id: string
  name: string
  status: 'stopped' | 'starting' | 'running'
  port: number | null
  previewUrl: string | null
  icon: string
}

export interface RunnerConfigData {
  id: string
  projectId: string
  name: string
  command: string
  cwd: string
  port: number | null
  portArg: string | null
  env: Record<string, string>
  readyPattern: string | null
  previewUrl: string | null
  icon: string
  sortOrder: number
  autoDetected: boolean
}

export interface NodeInstallation { label: string; path: string; version: string }

// Subscribe events
export interface RunnerOutputEvent { configId: string; name: string; line: string }

/* ── Claude ── */

export interface ClaudePromptInput { sessionId: string; prompt: string }
export interface ClaudeCancelInput { sessionId: string }

// Subscribe events
export interface ClaudeMessageEvent { sessionId: string; content: string; isPartial: boolean }
export interface ClaudeToolUseEvent { sessionId: string; toolId: string; toolName: string; input: Record<string, unknown> }
export interface ClaudeDoneEvent { sessionId: string; costUsd: number; durationMs: number }
export interface ClaudeErrorEvent { sessionId: string; error: string; code: string }

/* ── Git ── */

export interface GitStatusResult {
  initialized: boolean
  branch: string
  changedCount: number
  syncStatus: 'synced' | 'ahead' | 'behind' | 'diverged' | 'local-only' | 'unknown'
  ahead: number
  behind: number
}

export interface GitChangedFile {
  path: string
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  staged: boolean
}

export interface GitCommitEntry {
  hash: string
  message: string
  author: string
  date: string
  filesChanged: number
}

export interface GitBranchInfo {
  name: string
  current: boolean
  label: string
}

export interface GitSyncStatus {
  ahead: number
  behind: number
  hasRemote: boolean
}

export interface GitConflictFile {
  path: string
}

export interface GitCommitDetail {
  hash: string
  message: string
  author: string
  date: string
  files: { path: string; status: string; insertions: number; deletions: number }[]
  diff: string
}

export interface GitCommitDetailInput { hash: string }
export interface GitCommitInput { message: string; files?: string[] }
export interface GitHistoryInput { limit?: number }
export interface GitDiffInput { path: string }
export interface GitCreateBranchInput { name: string }
export interface GitSwitchBranchInput { name: string }
export interface GitMergeInput { source: string; target: string }
export interface GitMergeResult { success: boolean; conflicts: string[] }
export interface GitSyncResult { success: boolean; error?: string }
export interface GitResolveConflictInput { path: string; resolution: 'ours' | 'theirs' }

/* ── Agents ── */

export type AgentRole =
  | 'frontend-engineer' | 'backend-engineer' | 'fullstack-engineer'
  | 'devops-engineer' | 'qa-engineer' | 'security-engineer'
  | 'database-engineer' | 'ui-designer' | 'technical-writer'
  | 'code-reviewer' | 'architect' | 'product-manager'

export type AgentTeam = 'product' | 'architecture' | 'engineering' | 'quality' | 'documentation'

export interface AgentTeamDefinition {
  team: AgentTeam
  title: string
  description: string
  roles: AgentRole[]
}

export const AGENT_TEAMS: AgentTeamDefinition[] = [
  {
    team: 'product',
    title: 'Product & Strategy',
    description: 'The decision-maker and requirement owner. Drives priorities.',
    roles: ['product-manager'],
  },
  {
    team: 'architecture',
    title: 'Architecture & Infrastructure',
    description: 'System design, data layer, and deployment pipeline.',
    roles: ['architect', 'database-engineer', 'devops-engineer'],
  },
  {
    team: 'engineering',
    title: 'Engineering',
    description: 'The core builders — backend, frontend, design, and fullstack.',
    roles: ['backend-engineer', 'frontend-engineer', 'fullstack-engineer', 'ui-designer'],
  },
  {
    team: 'quality',
    title: 'Quality & Assurance',
    description: 'Reviews correctness, security, and test coverage.',
    roles: ['qa-engineer', 'code-reviewer', 'security-engineer'],
  },
  {
    team: 'documentation',
    title: 'Documentation',
    description: 'Technical docs, API references, and developer guides.',
    roles: ['technical-writer'],
  },
]

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'paused' | 'error' | 'done'

export interface AgentInfo {
  role: AgentRole
  title: string
  description: string
  isRunning: boolean
}

export interface AgentRouteResult {
  role: AgentRole
  confidence: 'high' | 'medium' | 'low'
}

export interface AgentExecution {
  id: string
  agentId: string
  sessionId: string
  status: AgentStatus
  prompt: string
  startedAt: string
  completedAt: string | null
  costUsd: number
  durationMs: number
  error: string | null
}

export type AgentEventType = 'status' | 'message' | 'tool_use' | 'tool_result' | 'thinking' | 'error' | 'done' | 'handoff' | 'activity' | 'task_status' | 'subtask_status' | 'dispatch_plan'

export interface AgentEvent {
  type: AgentEventType
  agentId: string
  executionId: string
  timestamp: string
  data: Record<string, any>
}

export type TaskModel = 'fast' | 'balanced' | 'premium'
export type ReviewLevel = 'none' | 'light' | 'full'

export interface DispatchTask {
  id: string
  title: string
  description: string
  role: AgentRole
  prompt: string
  dependsOn: string[]
  /** AI model selected by PM based on task complexity */
  model: TaskModel
  /** How much quality gate scrutiny this task receives */
  reviewLevel: ReviewLevel
  /** Client-side tracking */
  status?: 'pending' | 'running' | 'done' | 'error' | 'skipped'
}

export interface DispatchPlan {
  mode: 'single' | 'multi' | 'clarification'
  task?: DispatchTask
  tasks: DispatchTask[]
  summary: string
}

export interface DispatchResult {
  plan: DispatchPlan
  executions: AgentExecution[]
}

export interface PipelineTemplate {
  id: string
  name: string
  description: string
  steps: { role: AgentRole; promptTemplate: string; dependsOn: number | null }[]
}

export interface WorkflowEvent {
  type: string
  workflowId: string
  stepIndex: number | null
  timestamp: string
  data: Record<string, any>
}

export interface BuildEvent {
  type: string
  buildId: string
  timestamp: string
  phaseIndex?: number
  taskId?: string
  data: Record<string, any>
}

export interface InputRequest {
  id: string
  type: 'approve' | 'choose' | 'text'
  question: string
  context?: string
  options?: { value: string; label: string }[]
  defaultValue: string
  source: { buildId: string; phaseIndex?: number; taskId?: string }
  timestamp: string
}

/* ── Re-exports for convenience ── */

export type { Project, Session, SessionSummary, FileNode, PromptTemplate, HealthStatus }
