import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { agentDispatches, agentTasks } from "../../../db/schema.js";
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
 * Usage data rooted in the `agent_tasks` table.
 *
 * Implements two interfaces with different granularities:
 * - UsageSource (scope: "agent-task") — per-task records for the live
 *   meter, because one meter is one sub-agent in flight.
 * - HistorySource (historyScope: "agent-dispatch") — rolls those tasks
 *   up to the dispatch, because that's the user-level turn shown in the
 *   history page.
 *
 * Grouping happens in JS on the result set — turns per project stay
 * in the hundreds-to-low-thousands range, so SQL-side GROUP BY wouldn't
 * buy us much and costs readability.
 */
export class AgentTaskUsageSource implements UsageSource, HistorySource {
  readonly scope = "agent-task" as const;
  readonly historyScope = "agent-dispatch" as const;

  constructor(
    private readonly db: Database,
    private readonly catalog: ModelCatalog = new ModelCatalog(),
  ) {}

  getLatest(taskId: string): UsageRecord | null {
    const row = this.db
      .select({
        id: agentTasks.id,
        projectId: agentDispatches.projectId,
        tokensInput: agentTasks.tokensInput,
        tokensOutput: agentTasks.tokensOutput,
        tokensCacheRead: agentTasks.tokensCacheRead,
        tokensCacheCreation: agentTasks.tokensCacheCreation,
        model: agentTasks.model,
        finishedAt: agentTasks.finishedAt,
      })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(and(eq(agentTasks.id, taskId), isNotNull(agentTasks.tokensInput)))
      .orderBy(desc(agentTasks.finishedAt))
      .limit(1)
      .get();

    return row ? this.toRecord(row) : null;
  }

  listByProject(projectId: string): UsageRecord[] {
    const rows = this.db
      .select({
        id: agentTasks.id,
        projectId: agentDispatches.projectId,
        tokensInput: agentTasks.tokensInput,
        tokensOutput: agentTasks.tokensOutput,
        tokensCacheRead: agentTasks.tokensCacheRead,
        tokensCacheCreation: agentTasks.tokensCacheCreation,
        model: agentTasks.model,
        finishedAt: agentTasks.finishedAt,
      })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(
        and(
          eq(agentDispatches.projectId, projectId),
          isNotNull(agentTasks.tokensInput),
        ),
      )
      .all();

    return rows.map((r) => this.toRecord(r));
  }

  /**
   * Per-task rows for one multi-agent conversation, with the role
   * attached. Used to compute conversation-scoped stats + per-agent
   * rollups for the agent stats drawer.
   */
  listByConversation(
    conversationId: string,
  ): Array<{
    role: string;
    breakdown: TokenBreakdown;
    model: string | null;
    dispatchId: string;
    finishedAt: string | null;
  }> {
    const rows = this.db
      .select({
        role: agentTasks.role,
        tokensInput: agentTasks.tokensInput,
        tokensOutput: agentTasks.tokensOutput,
        tokensCacheRead: agentTasks.tokensCacheRead,
        tokensCacheCreation: agentTasks.tokensCacheCreation,
        model: agentTasks.model,
        dispatchId: agentTasks.dispatchId,
        finishedAt: agentTasks.finishedAt,
      })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(
        and(
          eq(agentDispatches.conversationId, conversationId),
          isNotNull(agentTasks.tokensInput),
        ),
      )
      .all();

    return rows.map((r) => ({
      role: r.role,
      breakdown: {
        input: r.tokensInput ?? 0,
        output: r.tokensOutput ?? 0,
        cacheRead: r.tokensCacheRead ?? 0,
        cacheCreation: r.tokensCacheCreation ?? 0,
      },
      model: r.model,
      dispatchId: r.dispatchId,
      finishedAt: r.finishedAt,
    }));
  }

  listAggregates(projectId: string): ScopeAggregate[] {
    const rows = this.db
      .select({
        taskId: agentTasks.id,
        dispatchId: agentTasks.dispatchId,
        dispatchPrompt: agentDispatches.prompt,
        tokensInput: agentTasks.tokensInput,
        tokensOutput: agentTasks.tokensOutput,
        tokensCacheRead: agentTasks.tokensCacheRead,
        tokensCacheCreation: agentTasks.tokensCacheCreation,
        model: agentTasks.model,
        finishedAt: agentTasks.finishedAt,
      })
      .from(agentTasks)
      .innerJoin(agentDispatches, eq(agentTasks.dispatchId, agentDispatches.id))
      .where(
        and(
          eq(agentDispatches.projectId, projectId),
          isNotNull(agentTasks.tokensInput),
        ),
      )
      .orderBy(asc(agentTasks.finishedAt))
      .all();

    const byDispatch = new Map<
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
      const id = row.dispatchId;
      const timestamp = row.finishedAt ?? new Date(0).toISOString();
      const prev = byDispatch.get(id);
      const next = prev ?? {
        title: truncate(row.dispatchPrompt, 80),
        breakdown: { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 },
        turnCount: 0,
        lastActivity: timestamp,
        latestModel: row.model,
      };
      next.breakdown.input += row.tokensInput ?? 0;
      next.breakdown.output += row.tokensOutput ?? 0;
      next.breakdown.cacheRead += row.tokensCacheRead ?? 0;
      next.breakdown.cacheCreation += row.tokensCacheCreation ?? 0;
      next.turnCount += 1;
      if (timestamp >= next.lastActivity) {
        next.lastActivity = timestamp;
        if (row.model) next.latestModel = row.model;
      }
      byDispatch.set(id, next);
    }

    return Array.from(byDispatch.entries())
      .map(([scopeId, v]) => {
        const info = this.catalog.lookup(v.latestModel);
        return {
          scope: "agent-dispatch" as const,
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

  listTurns(dispatchId: string): UsageTurn[] {
    const rows = this.db
      .select({
        id: agentTasks.id,
        title: agentTasks.title,
        role: agentTasks.role,
        tokensInput: agentTasks.tokensInput,
        tokensOutput: agentTasks.tokensOutput,
        tokensCacheRead: agentTasks.tokensCacheRead,
        tokensCacheCreation: agentTasks.tokensCacheCreation,
        model: agentTasks.model,
        finishedAt: agentTasks.finishedAt,
      })
      .from(agentTasks)
      .where(
        and(
          eq(agentTasks.dispatchId, dispatchId),
          isNotNull(agentTasks.tokensInput),
        ),
      )
      .orderBy(asc(agentTasks.finishedAt))
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
        title: `${r.role} · ${r.title}`,
        breakdown,
        total: totalOf(breakdown),
        model: r.model,
        timestamp: r.finishedAt ?? new Date(0).toISOString(),
        costUsd: costOfBreakdown(breakdown, this.catalog.pricingFor(r.model)),
      };
    });
  }

  private toRecord(row: {
    id: string;
    projectId: string;
    tokensInput: number | null;
    tokensOutput: number | null;
    tokensCacheRead: number | null;
    tokensCacheCreation: number | null;
    model: string | null;
    finishedAt: string | null;
  }): UsageRecord {
    return {
      scope: "agent-task",
      scopeId: row.id,
      projectId: row.projectId,
      tokens: {
        input: row.tokensInput ?? 0,
        output: row.tokensOutput ?? 0,
        cacheRead: row.tokensCacheRead ?? 0,
        cacheCreation: row.tokensCacheCreation ?? 0,
      },
      model: row.model,
      timestamp: row.finishedAt ?? new Date(0).toISOString(),
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
