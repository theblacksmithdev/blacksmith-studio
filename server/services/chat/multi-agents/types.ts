/* ── Domain types ── */

export interface AgentDispatchRecord {
  id: string;
  projectId: string;
  prompt: string;
  planMode: string;
  planSummary: string;
  status: string;
  totalCostUsd: number;
  totalDurationMs: number;
  createdAt: string;
  completedAt: string | null;
  tasks: AgentTaskRecord[];
}

export interface AgentTaskRecord {
  id: string;
  dispatchId: string;
  title: string;
  description: string | null;
  role: string;
  prompt: string;
  status: string;
  taskType: string | null;
  parentTaskId: string | null;
  orderIndex: number;
  executionId: string | null;
  sessionId: string | null;
  responseText: string | null;
  error: string | null;
  costUsd: number;
  durationMs: number;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface ChatAttachmentInput {
  id: string;
  name: string;
  kind: "image" | "text" | "code" | "pdf" | "file";
  mime: string;
  size: number;
  absPath: string;
  relPath: string;
}

export interface AgentChatRecord {
  id: string;
  projectId: string;
  role: string;
  agentRole: string | null;
  content: string;
  attachments: ChatAttachmentInput[] | null;
  dispatchId: string | null;
  timestamp: string;
}

export interface ConversationRecord {
  id: string;
  title: string;
  /** Claude CLI session id the PM uses for this conversation (set after first dispatch). */
  pmSessionId: string | null;
  /** Most recent PM plan summary, cached for UI + downstream context. */
  lastPlanSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary extends ConversationRecord {
  messageCount: number;
}

/* ── Input shapes for writes ── */

export interface TaskInput {
  id: string;
  title: string;
  description?: string;
  role: string;
  prompt: string;
}

export interface SubTaskInput {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  role: string;
}

export interface TaskStatusUpdate {
  executionId?: string;
  sessionId?: string;
  responseText?: string;
  error?: string;
  costUsd?: number;
  durationMs?: number;
}
