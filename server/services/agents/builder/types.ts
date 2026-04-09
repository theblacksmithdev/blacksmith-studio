import type { AgentRole } from '../types.js'

/* ── Structured Plan ── */

export interface BuildTask {
  id: string
  title: string
  description: string
  role: AgentRole
  prompt: string
  /** Task IDs this depends on (not indices — stable references) */
  dependsOn: string[]
}

export interface BuildPhase {
  id: string
  name: string
  description: string
  /** If true, run a verification step after all tasks in this phase complete */
  verify: boolean
  tasks: BuildTask[]
}

export interface BuildPlan {
  id: string
  name: string
  summary: string
  phases: BuildPhase[]
  totalTasks: number
}

/* ── Execution State ── */

export type BuildStatus = 'planning' | 'executing' | 'verifying' | 'completed' | 'failed' | 'cancelled'

export interface BuildTaskResult {
  taskId: string
  role: AgentRole
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  executionId: string | null
  /** Detailed summary of what the agent actually did */
  summary: string | null
  error: string | null
  costUsd: number
  durationMs: number
  /** Session ID — reusable if the same role needs a follow-up in a later phase */
  sessionId: string | null
}

export interface BuildProgress {
  id: string
  plan: BuildPlan
  status: BuildStatus
  currentPhase: number
  results: Map<string, BuildTaskResult>
  /** Accumulated context: what's been built so far, updated after each phase */
  buildContext: string[]
  totalCostUsd: number
  totalDurationMs: number
  startedAt: string
  completedAt: string | null
  retryCount: number
}

/* ── Events ── */

export type BuildEventType =
  | 'build:plan_started'
  | 'build:plan_ready'
  | 'build:phase_started'
  | 'build:phase_completed'
  | 'build:phase_verified'
  | 'build:task_started'
  | 'build:task_completed'
  | 'build:task_failed'
  | 'build:task_retrying'
  | 'build:completed'
  | 'build:failed'
  | 'build:cancelled'

export interface BuildEvent {
  type: BuildEventType
  buildId: string
  timestamp: string
  phaseIndex?: number
  taskId?: string
  data: {
    message: string
    role?: AgentRole
    costUsd?: number
    durationMs?: number
    plan?: BuildPlan
    progress?: { completed: number; total: number; phase: string }
  }
}

export type BuildEventCallback = (event: BuildEvent) => void

/* ── Checkpoint (serializable snapshot for resume) ── */

export interface BuildCheckpoint {
  buildId: string
  plan: BuildPlan
  results: Record<string, BuildTaskResult>
  buildContext: string[]
  currentPhase: number
  totalCostUsd: number
  totalDurationMs: number
  startedAt: string
}
