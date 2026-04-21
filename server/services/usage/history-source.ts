import type { HistoryScope, ScopeAggregate, UsageTurn } from "./types.js";

/**
 * Strategy for aggregating usage at the history page's granularity.
 *
 * Separate from UsageSource because the meter scope (single session or
 * single task) doesn't always match the aggregate scope (session or
 * dispatch). New aggregate flavors plug in by implementing this —
 * UsageService composes an array and routes by `historyScope`.
 */
export interface HistorySource {
  readonly historyScope: HistoryScope;

  /** One aggregate per scope instance within the project. */
  listAggregates(projectId: string): ScopeAggregate[];

  /** Individual turns inside one scope instance, chronological. */
  listTurns(scopeId: string): UsageTurn[];
}
