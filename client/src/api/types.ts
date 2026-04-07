import type { Project } from '@/stores/project-store'
import type {
  Session,
  SessionSummary,
  FileNode,
  PromptTemplate,
  HealthStatus,
} from '@/types'

/* ── Projects ── */

export interface ProjectRegisterInput { path: string; name?: string }
export interface ProjectCreateInput { name: string; parentPath: string; ai: boolean; backendPort?: number; frontendPort?: number; theme?: string }
export interface ProjectActivateInput { id: string }
export interface ProjectRenameInput { id: string; name: string }
export interface ProjectRemoveInput { id: string; hard?: boolean }
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

export type RunnerTarget = 'backend' | 'frontend' | 'all'
export interface RunnerTargetInput { target: RunnerTarget }
export interface RunnerServiceStatus { status: 'stopped' | 'starting' | 'running'; port: number | null }
export interface RunnerStatusResult { backend: RunnerServiceStatus; frontend: RunnerServiceStatus }

// Subscribe events
export interface RunnerOutputEvent { source: 'backend' | 'frontend'; line: string }

/* ── Claude ── */

export interface ClaudePromptInput { sessionId: string; prompt: string }
export interface ClaudeCancelInput { sessionId: string }

// Subscribe events
export interface ClaudeMessageEvent { sessionId: string; content: string; isPartial: boolean }
export interface ClaudeToolUseEvent { sessionId: string; toolId: string; toolName: string; input: Record<string, unknown> }
export interface ClaudeDoneEvent { sessionId: string; costUsd: number; durationMs: number }
export interface ClaudeErrorEvent { sessionId: string; error: string; code: string }

/* ── Re-exports for convenience ── */

export type { Project, Session, SessionSummary, FileNode, PromptTemplate, HealthStatus }
