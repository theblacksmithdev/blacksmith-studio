import type { AiProviderId } from "../ai/model-catalog.js";

/**
 * The conversation unit for the live meter: a single chat session or
 * a single agent task. Meter queries always target one of these.
 */
export type UsageScope = "chat-session" | "agent-task";

/**
 * The aggregate unit for the history page: a chat session (same
 * granularity) or an agent dispatch (roll-up over its tasks). Separate
 * from UsageScope because a dispatch isn't a meter-able thing — it's
 * a user-level turn with one or more sub-agent executions under it.
 */
export type HistoryScope = "chat-session" | "agent-dispatch";

/** Canonical token breakdown — mirrors TokenUsage's JSON shape. */
export interface TokenBreakdown {
  input: number;
  output: number;
  cacheRead: number;
  cacheCreation: number;
}

/**
 * A single recorded assistant turn. The scope discriminant + scopeId tell
 * us where it came from (chat session vs agent task); callers that only
 * care about totals can ignore the source entirely.
 */
export interface UsageRecord {
  scope: UsageScope;
  scopeId: string;
  projectId: string;
  tokens: TokenBreakdown;
  model: string | null;
  timestamp: string;
}

/** Response for the live meter. Last-turn snapshot against the model's window. */
export interface SessionMeter {
  scope: UsageScope;
  scopeId: string;
  used: number;
  window: number;
  model: string | null;
  provider: AiProviderId;
  label: string;
  tokens: TokenBreakdown;
  updatedAt: string | null;
}

/**
 * One row in the history list. Represents a full chat session or a full
 * agent dispatch with its rolled-up token totals and domain label.
 */
export interface ScopeAggregate {
  scope: HistoryScope;
  scopeId: string;
  /** Session name / dispatch prompt (truncated). */
  title: string;
  total: number;
  breakdown: TokenBreakdown;
  /** Messages (chat) or tasks (agent) that carried token data. */
  turnCount: number;
  lastActivity: string;
  /** Most recently-used model within this scope. */
  model: string | null;
  modelLabel: string;
}

/** Per-turn detail returned when drilling into a scope aggregate. */
export interface UsageTurn {
  id: string;
  title: string | null;
  breakdown: TokenBreakdown;
  total: number;
  model: string | null;
  timestamp: string;
}

/** Per-model rollup for the history header. */
export interface ModelRollup {
  model: string | null;
  label: string;
  provider: AiProviderId;
  total: number;
  breakdown: TokenBreakdown;
}

/** Top-level response for the history page. */
export interface UsageHistory {
  projectId: string;
  total: number;
  breakdown: TokenBreakdown;
  byModel: ModelRollup[];
  chatSessions: ScopeAggregate[];
  agentDispatches: ScopeAggregate[];
}

/** Drill-down response for one scope row. */
export interface ScopeDetail {
  scope: HistoryScope;
  scopeId: string;
  title: string;
  total: number;
  breakdown: TokenBreakdown;
  turns: UsageTurn[];
}
