/* ── Agent Teams (departments) ── */

export type AgentTeam =
  | "product"
  | "architecture"
  | "engineering"
  | "quality"
  | "documentation"
  | "generalist";

export interface AgentTeamDefinition {
  team: AgentTeam;
  title: string;
  description: string;
  /** Roles belonging to this team, in display order */
  roles: AgentRole[];
}

export const AGENT_TEAMS: AgentTeamDefinition[] = [
  {
    team: "product",
    title: "Product & Strategy",
    description:
      "The decision-maker and requirement owner. Sits above all sub-teams and drives priorities.",
    roles: ["product-manager"],
  },
  {
    team: "architecture",
    title: "Architecture & Infrastructure",
    description:
      "Owns the technical foundation — system design, data layer, and deployment pipeline. Works first, before any code is written.",
    roles: ["architect", "database-engineer", "devops-engineer"],
  },
  {
    team: "engineering",
    title: "Engineering Core",
    description:
      "The core builders. UI/UX feeds into Frontend, while Backend and Fullstack bridge both worlds.",
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
    description:
      "Acts as a gate before anything ships. Reviews correctness, security vulnerabilities, and test coverage.",
    roles: ["qa-engineer", "code-reviewer", "security-engineer"],
  },
  {
    team: "documentation",
    title: "Documentation",
    description:
      "Maintains technical documentation, API references, and developer guides to keep the team aligned.",
    roles: ["technical-writer"],
  },
  {
    team: "generalist",
    title: "Generalist",
    description:
      "A catch-all engineer that handles any kind of task end-to-end — used by the single-agent chat where the user talks directly to one AI without a specialised team.",
    roles: ["generalist"],
  },
];

/* ── Agent Identity ── */

/** Every agent role maps to a real tech discipline */
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
  | "product-manager"
  | "generalist";

/** Static metadata that defines an agent role */
export interface AgentRoleDefinition {
  role: AgentRole;
  /** Which team/department this role belongs to */
  team: AgentTeam;
  title: string;
  /** Short display label for task badges (e.g. "Frontend", "Backend", "Design") */
  label: string;
  description: string;
  /** System prompt injected into every session for this role */
  systemPrompt: string;
  /** Which file patterns this agent focuses on (for context filtering) */
  filePatterns: string[];
  /** Default permission mode for Claude CLI */
  permissionMode: string;
  /** Preferred model override (null = use project default) */
  preferredModel: string | null;
  /** Maximum budget per execution in USD (null = use project default) */
  maxBudget: number | null;
  /** MCP server names this agent should have access to */
  mcpServers: string[] | "all";
  /** Tool names this agent is allowed/expected to use */
  allowedTools: string[] | "all";
  /** Directories this agent should focus on within the project */
  scopeDirs: string[];
  /**
   * Config/entry files the agent needs for context (e.g. tsconfig.json, manage.py).
   * Looked up in both the project root and each scope dir.
   * Directories are skipped — only regular files are read.
   */
  keyFiles: string[];
  /**
   * If true, the agent can self-decompose complex tasks into smaller sub-tasks
   * and execute them serially within the same session. Each sub-task builds on
   * the previous one's output. Only enable for implementation-heavy roles.
   */
  selfDecompose: boolean;
}

/* ── Agent Execution ── */

export type AgentStatus =
  | "idle"
  | "thinking"
  | "executing"
  | "paused"
  | "error"
  | "done";

/** A running or completed agent execution */
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
  /** The agent's full text response. Available after execution completes. */
  responseText: string;
  /** The dispatch task ID this execution fulfils (set by executeTaskPlan) */
  taskId?: string;
}

/** Live state of a running agent process */
export interface AgentProcess {
  execution: AgentExecution;
  /** Abort the underlying AI stream (subprocess kill, HTTP abort, etc.). */
  cancel(): void;
}

/* ── Agent Events (streamed to UI) ── */

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
  data: AgentEventData;
}

export type AgentEventData =
  | { type: "status"; status: AgentStatus; message?: string }
  | { type: "message"; content: string; isPartial: boolean }
  | {
      type: "tool_use";
      toolId: string;
      toolName: string;
      input: Record<string, unknown>;
    }
  | { type: "tool_result"; toolId: string; output: string }
  | { type: "thinking"; content: string }
  | { type: "error"; error: string; recoverable: boolean }
  | { type: "done"; costUsd: number; durationMs: number; summary: string }
  | { type: "handoff"; targetRole: AgentRole; reason: string; context: string }
  | { type: "activity"; description: string }
  | {
      type: "task_status";
      taskId: string;
      status: "pending" | "running" | "done" | "error" | "skipped";
      title: string;
      role: AgentRole;
    }
  | {
      type: "subtask_status";
      parentTaskId: string;
      subtaskId: string;
      status: "pending" | "running" | "done" | "error";
      title: string;
      index: number;
      total: number;
    }
  | {
      type: "dispatch_plan";
      plan: {
        mode: string;
        summary: string;
        tasks: {
          id: string;
          title: string;
          description: string;
          role: AgentRole;
          dependsOn: string[];
          model: string;
          reviewLevel: string;
        }[];
      };
    };

/* ── Agent Configuration (per project) ── */

export interface AgentConfig {
  role: AgentRole;
  enabled: boolean;
  /** Additional instructions layered on top of role system prompt */
  customInstructions: string;
  /** Override model for this specific agent */
  model: string | null;
  /** Override budget for this specific agent */
  maxBudget: number | null;
}

/* ── Workflow (managed multi-agent execution) ── */

export type WorkflowStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/** A single step in a workflow pipeline */
export interface WorkflowStep {
  role: AgentRole;
  prompt: string;
  /** If set, this step depends on the output of a previous step (by index) */
  dependsOn: number | null;
  status: WorkflowStatus;
  executionId: string | null;
  result: string | null;
  error: string | null;
}

/** A multi-agent workflow managed by AgentManager */
export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  totalCostUsd: number;
  totalDurationMs: number;
  startedAt: string;
  completedAt: string | null;
  maxBudgetUsd: number | null;
}

export type WorkflowEventType =
  | "workflow:started"
  | "workflow:step_started"
  | "workflow:step_completed"
  | "workflow:step_failed"
  | "workflow:completed"
  | "workflow:failed"
  | "workflow:cancelled";

export interface WorkflowEvent {
  type: WorkflowEventType;
  workflowId: string;
  stepIndex: number | null;
  timestamp: string;
  data: {
    role?: AgentRole;
    status: WorkflowStatus;
    message?: string;
    costUsd?: number;
    durationMs?: number;
  };
}

export type WorkflowEventCallback = (event: WorkflowEvent) => void;

/* ── Callbacks ── */

export type AgentEventCallback = (event: AgentEvent) => void;
