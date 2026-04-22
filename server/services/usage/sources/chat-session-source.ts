import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { messages, sessions } from "../../../db/schema.js";
import type { Database } from "../../../db/index.js";
import type { UsageSource } from "../source.js";
import type { HistorySource } from "../history-source.js";
import type {
  ScopeAggregate,
  TokenBreakdown,
  UsageRecord,
  UsageTurn,
} from "../types.js";
import { ModelCatalog } from "../../ai/model-catalog.js";
import { costOfBreakdown } from "../cost.js";

/**
 * Usage source backed by the `messages` table (single-agent chat).
 *
 * SRP: translates message rows into usage shapes. Filters out rows that
 * carry no token data (user turns, errored assistant turns) so callers
 * don't need defensive checks.
 *
 * Implements both UsageSource (for the live meter) and HistorySource
 * (for the history page). Session is the same granularity in both.
 */
export class ChatSessionUsageSource implements UsageSource, HistorySource {
  readonly scope = "chat-session" as const;
  readonly historyScope = "chat-session" as const;

  constructor(
    private readonly db: Database,
    private readonly catalog: ModelCatalog = new ModelCatalog(),
  ) {}

  getLatest(sessionId: string): UsageRecord | null {
    const row = this.db
      .select({
        sessionId: messages.sessionId,
        projectId: sessions.projectId,
        tokensInput: messages.tokensInput,
        tokensOutput: messages.tokensOutput,
        tokensCacheRead: messages.tokensCacheRead,
        tokensCacheCreation: messages.tokensCacheCreation,
        model: messages.model,
        timestamp: messages.timestamp,
      })
      .from(messages)
      .innerJoin(sessions, eq(messages.sessionId, sessions.id))
      .where(
        and(eq(messages.sessionId, sessionId), isNotNull(messages.tokensInput)),
      )
      .orderBy(desc(messages.timestamp))
      .limit(1)
      .get();

    return row ? this.toRecord(row) : null;
  }

  listByProject(projectId: string): UsageRecord[] {
    const rows = this.db
      .select({
        sessionId: messages.sessionId,
        projectId: sessions.projectId,
        tokensInput: messages.tokensInput,
        tokensOutput: messages.tokensOutput,
        tokensCacheRead: messages.tokensCacheRead,
        tokensCacheCreation: messages.tokensCacheCreation,
        model: messages.model,
        timestamp: messages.timestamp,
      })
      .from(messages)
      .innerJoin(sessions, eq(messages.sessionId, sessions.id))
      .where(
        and(eq(sessions.projectId, projectId), isNotNull(messages.tokensInput)),
      )
      .all();

    return rows.map((r) => this.toRecord(r));
  }

  listAggregates(projectId: string): ScopeAggregate[] {
    // Row-level pull; grouping done in JS because SQLite's GROUP BY on
    // multiple sums via drizzle is verbose for this size of dataset.
    const rows = this.db
      .select({
        sessionId: messages.sessionId,
        sessionName: sessions.name,
        tokensInput: messages.tokensInput,
        tokensOutput: messages.tokensOutput,
        tokensCacheRead: messages.tokensCacheRead,
        tokensCacheCreation: messages.tokensCacheCreation,
        model: messages.model,
        timestamp: messages.timestamp,
      })
      .from(messages)
      .innerJoin(sessions, eq(messages.sessionId, sessions.id))
      .where(
        and(eq(sessions.projectId, projectId), isNotNull(messages.tokensInput)),
      )
      .orderBy(asc(messages.timestamp))
      .all();

    const bySession = new Map<
      string,
      {
        title: string;
        breakdown: TokenBreakdown;
        turnCount: number;
        lastActivity: string;
        latestModel: string | null;
      }
    >();

    for (const row of rows) {
      const id = row.sessionId;
      const prev = bySession.get(id);
      const next = prev ?? {
        title: row.sessionName,
        breakdown: { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 },
        turnCount: 0,
        lastActivity: row.timestamp,
        latestModel: row.model,
      };
      next.breakdown.input += row.tokensInput ?? 0;
      next.breakdown.output += row.tokensOutput ?? 0;
      next.breakdown.cacheRead += row.tokensCacheRead ?? 0;
      next.breakdown.cacheCreation += row.tokensCacheCreation ?? 0;
      next.turnCount += 1;
      if (row.timestamp >= next.lastActivity) {
        next.lastActivity = row.timestamp;
        if (row.model) next.latestModel = row.model;
      }
      bySession.set(id, next);
    }

    return Array.from(bySession.entries())
      .map(([scopeId, v]) => {
        const info = this.catalog.lookup(v.latestModel);
        return {
          scope: "chat-session" as const,
          scopeId,
          title: v.title,
          total: totalOf(v.breakdown),
          breakdown: v.breakdown,
          turnCount: v.turnCount,
          lastActivity: v.lastActivity,
          model: v.latestModel,
          modelLabel: info.label,
          costUsd: costOfBreakdown(v.breakdown, info.pricing),
        };
      })
      .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
  }

  listTurns(sessionId: string): UsageTurn[] {
    const rows = this.db
      .select({
        id: messages.id,
        content: messages.content,
        tokensInput: messages.tokensInput,
        tokensOutput: messages.tokensOutput,
        tokensCacheRead: messages.tokensCacheRead,
        tokensCacheCreation: messages.tokensCacheCreation,
        model: messages.model,
        timestamp: messages.timestamp,
      })
      .from(messages)
      .where(
        and(eq(messages.sessionId, sessionId), isNotNull(messages.tokensInput)),
      )
      .orderBy(asc(messages.timestamp))
      .all();

    return rows.map((r) => {
      const breakdown: TokenBreakdown = {
        input: r.tokensInput ?? 0,
        output: r.tokensOutput ?? 0,
        cacheRead: r.tokensCacheRead ?? 0,
        cacheCreation: r.tokensCacheCreation ?? 0,
      };
      return {
        id: r.id,
        title: truncate(r.content, 80),
        breakdown,
        total: totalOf(breakdown),
        model: r.model,
        timestamp: r.timestamp,
        costUsd: costOfBreakdown(breakdown, this.catalog.pricingFor(r.model)),
      };
    });
  }

  private toRecord(row: {
    sessionId: string;
    projectId: string;
    tokensInput: number | null;
    tokensOutput: number | null;
    tokensCacheRead: number | null;
    tokensCacheCreation: number | null;
    model: string | null;
    timestamp: string;
  }): UsageRecord {
    return {
      scope: "chat-session",
      scopeId: row.sessionId,
      projectId: row.projectId,
      tokens: {
        input: row.tokensInput ?? 0,
        output: row.tokensOutput ?? 0,
        cacheRead: row.tokensCacheRead ?? 0,
        cacheCreation: row.tokensCacheCreation ?? 0,
      },
      model: row.model,
      timestamp: row.timestamp,
    };
  }
}

function totalOf(b: TokenBreakdown): number {
  return b.input + b.output + b.cacheRead + b.cacheCreation;
}

function truncate(s: string, max: number): string {
  const trimmed = s.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? trimmed.slice(0, max - 1) + "…" : trimmed;
}
