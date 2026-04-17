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
  role: string;
  prompt: string;
  status: string;
  orderIndex: number;
  executionId: string | null;
  sessionId: string | null;
  responseText: string | null;
  error: string | null;
  costUsd: number;
  durationMs: number;
}

export interface AgentChatRecord {
  id: string;
  projectId: string;
  role: string;
  agentRole: string | null;
  content: string;
  dispatchId: string | null;
  timestamp: string;
}

export interface ConversationRecord {
  id: string;
  title: string;
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
