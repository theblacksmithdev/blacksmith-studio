import { ModelCatalog } from "../ai/model-catalog.js";
import type { UsageSource } from "./source.js";
import type { HistorySource } from "./history-source.js";
import type {
  HistoryScope,
  ModelRollup,
  ScopeAggregate,
  ScopeDetail,
  SessionMeter,
  TokenBreakdown,
  UsageHistory,
  UsageScope,
} from "./types.js";

/**
 * Facade over the usage read-side.
 *
 * SRP: answers "how many tokens did X use?" for any scope. Never
 * writes — persistence of tokens happens at the assistant-turn write
 * path (session-manager, task-status update).
 *
 * DIP: composes an array of UsageSource strategies so adding new
 * scopes (another provider's table, a different conversation shape)
 * means dropping another source in — not touching this class.
 */
export class UsageService {
  private readonly meterSourcesByScope = new Map<UsageScope, UsageSource>();
  private readonly historySourcesByScope = new Map<
    HistoryScope,
    HistorySource
  >();

  constructor(
    meterSources: UsageSource[],
    historySources: HistorySource[],
    private readonly catalog: ModelCatalog = new ModelCatalog(),
  ) {
    for (const s of meterSources) this.meterSourcesByScope.set(s.scope, s);
    for (const s of historySources)
      this.historySourcesByScope.set(s.historyScope, s);
  }

  /**
   * Last-turn snapshot against the model's context window — the figure
   * the meter shows. Matches what a user would see checking their AI
   * directly: tokens used vs window capacity.
   */
  getSessionMeter(scope: UsageScope, scopeId: string): SessionMeter {
    const source = this.requireSource(scope);
    const latest = source.getLatest(scopeId);
    const model = latest?.model ?? null;
    const info = this.catalog.lookup(model);
    const tokens = latest?.tokens ?? {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheCreation: 0,
    };
    const used =
      tokens.input + tokens.output + tokens.cacheRead + tokens.cacheCreation;

    return {
      scope,
      scopeId,
      used,
      window: info.contextWindow,
      model,
      provider: info.provider,
      label: info.label,
      tokens,
      updatedAt: latest?.timestamp ?? null,
    };
  }

  /**
   * Full history view for a project: cumulative totals, per-model
   * rollup, and expandable rows for every chat session + agent
   * dispatch that carried tokens.
   */
  getHistory(projectId: string): UsageHistory {
    const sessions = this.aggregatesFor("chat-session", projectId);
    const dispatches = this.aggregatesFor("agent-dispatch", projectId);

    const allAggregates = [...sessions, ...dispatches];
    const overall = sumBreakdown(allAggregates.map((a) => a.breakdown));
    const byModel = this.rollupByModel(allAggregates);

    return {
      projectId,
      total: totalOf(overall),
      breakdown: overall,
      byModel,
      chatSessions: sessions,
      agentDispatches: dispatches,
    };
  }

  /** Drill-down: per-turn records within one scope instance. */
  getScopeDetail(scope: HistoryScope, scopeId: string): ScopeDetail {
    const source = this.requireHistorySource(scope);
    const turns = source.listTurns(scopeId);
    const breakdown = sumBreakdown(turns.map((t) => t.breakdown));
    const title = turns[0]?.title ?? scopeId;
    return {
      scope,
      scopeId,
      title,
      total: totalOf(breakdown),
      breakdown,
      turns,
    };
  }

  private aggregatesFor(
    scope: HistoryScope,
    projectId: string,
  ): ScopeAggregate[] {
    const source = this.historySourcesByScope.get(scope);
    return source ? source.listAggregates(projectId) : [];
  }

  private rollupByModel(aggregates: ScopeAggregate[]): ModelRollup[] {
    const byModel = new Map<
      string,
      { breakdown: TokenBreakdown; model: string | null }
    >();
    for (const a of aggregates) {
      const key = a.model ?? "__unknown__";
      const entry = byModel.get(key) ?? {
        breakdown: { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 },
        model: a.model,
      };
      entry.breakdown = sumBreakdown([entry.breakdown, a.breakdown]);
      byModel.set(key, entry);
    }
    return Array.from(byModel.values())
      .map((v) => {
        const info = this.catalog.lookup(v.model);
        return {
          model: v.model,
          label: info.label,
          provider: info.provider,
          total: totalOf(v.breakdown),
          breakdown: v.breakdown,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  private requireSource(scope: UsageScope): UsageSource {
    const s = this.meterSourcesByScope.get(scope);
    if (!s) throw new Error(`No usage source registered for scope "${scope}".`);
    return s;
  }

  private requireHistorySource(scope: HistoryScope): HistorySource {
    const s = this.historySourcesByScope.get(scope);
    if (!s)
      throw new Error(`No history source registered for scope "${scope}".`);
    return s;
  }
}

function sumBreakdown(bs: TokenBreakdown[]): TokenBreakdown {
  return bs.reduce(
    (acc, b) => ({
      input: acc.input + b.input,
      output: acc.output + b.output,
      cacheRead: acc.cacheRead + b.cacheRead,
      cacheCreation: acc.cacheCreation + b.cacheCreation,
    }),
    { input: 0, output: 0, cacheRead: 0, cacheCreation: 0 },
  );
}

function totalOf(b: TokenBreakdown): number {
  return b.input + b.output + b.cacheRead + b.cacheCreation;
}
