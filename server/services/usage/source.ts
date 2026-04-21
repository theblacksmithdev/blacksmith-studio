import type { UsageRecord, UsageScope } from "./types.js";

/**
 * Strategy for pulling usage records out of one table.
 *
 * Open/Closed: new scopes (e.g. "agent-dispatch", another provider's
 * table) plug in by implementing this interface — UsageService never
 * changes.
 */
export interface UsageSource {
  /** Discriminant used to route getLatest / list calls. */
  readonly scope: UsageScope;

  /** Most recent turn in a single scope (session/task). Null if none. */
  getLatest(scopeId: string): UsageRecord | null;

  /** All turns within a project. Used by history aggregation. */
  listByProject(projectId: string): UsageRecord[];
}
