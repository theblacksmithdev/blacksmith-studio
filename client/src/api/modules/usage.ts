import { api as raw } from "../client";

export type UsageScope = "chat-session" | "agent-task";
export type HistoryScope = "chat-session" | "agent-dispatch";
export type UsageProvider = "anthropic" | "openai" | "google" | "unknown";

export interface TokenBreakdown {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

export interface SessionMeter {
  scope: UsageScope;
  scopeId: string;
  used: number;
  window: number;
  model: string | null;
  provider: UsageProvider;
  label: string;
  tokens: TokenBreakdown;
  updatedAt: string | null;
}

export interface ScopeAggregate {
  scope: HistoryScope;
  scopeId: string;
  title: string;
  total: number;
  breakdown: TokenBreakdown;
  turnCount: number;
  lastActivity: string;
  model: string | null;
  modelLabel: string;
  costUsd: number;
}

export interface UsageTurn {
  id: string;
  title: string | null;
  breakdown: TokenBreakdown;
  total: number;
  model: string | null;
  timestamp: string;
  costUsd: number;
}

export interface ModelRollup {
  model: string | null;
  label: string;
  provider: UsageProvider;
  total: number;
  breakdown: TokenBreakdown;
  costUsd: number;
}

export interface UsageHistory {
  projectId: string;
  total: number;
  breakdown: TokenBreakdown;
  costUsd: number;
  byModel: ModelRollup[];
  chatSessions: ScopeAggregate[];
  agentDispatches: ScopeAggregate[];
}

export interface ScopeDetail {
  scope: HistoryScope;
  scopeId: string;
  title: string;
  total: number;
  breakdown: TokenBreakdown;
  costUsd: number;
  turns: UsageTurn[];
}

export const usage = {
  getSessionMeter: (scope: UsageScope, scopeId: string) =>
    raw.invoke<SessionMeter>("usage:getSessionMeter", { scope, scopeId }),

  getHistory: (projectId: string) =>
    raw.invoke<UsageHistory>("usage:getHistory", { projectId }),

  getScopeDetail: (scope: HistoryScope, scopeId: string) =>
    raw.invoke<ScopeDetail>("usage:getScopeDetail", { scope, scopeId }),

  onUpdate: (cb: (data: SessionMeter) => void) =>
    raw.subscribe("usage:onUpdate", cb),
} as const;
