/**
 * Carries the cross-agent context for a single user turn: the raw user
 * prompt, the PM's Claude session id (for --resume), the prior chat
 * transcript, and the latest PM plan summary.
 *
 * Single Responsibility: own the shape and formatting of "what every agent
 * in the pipeline needs to know about this conversation." The dispatcher,
 * PM runner, and task context builder all consume the same object instead
 * of each rebuilding a subset of this state.
 *
 * Dependency Inversion: this is a plain value object. The IPC layer
 * constructs it from SQLite, passes it through AgentExecuteOptions, and
 * every downstream collaborator depends on this interface — not on the
 * repository it was loaded from.
 */

export interface ConversationMessage {
  role: "user" | "agent" | "system";
  agentRole?: string;
  content: string;
  timestamp: string;
}

export interface ConversationContextInit {
  originalUserPrompt: string;
  conversationId?: string;
  history?: ConversationMessage[];
  pmSessionId?: string;
  latestPlanSummary?: string;
}

const MAX_HISTORY_ENTRIES = 40;
const MAX_HISTORY_CHARS = 12_000;
const MAX_ENTRY_CHARS = 1_200;

export class ConversationContext {
  readonly originalUserPrompt: string;
  readonly conversationId: string | undefined;
  readonly history: readonly ConversationMessage[];
  readonly pmSessionId: string | undefined;
  readonly latestPlanSummary: string | undefined;

  constructor(init: ConversationContextInit) {
    this.originalUserPrompt = init.originalUserPrompt;
    this.conversationId = init.conversationId;
    this.history = Object.freeze([...(init.history ?? [])]);
    this.pmSessionId = init.pmSessionId;
    this.latestPlanSummary = init.latestPlanSummary;
  }

  /**
   * True when the PM already has a Claude session for this conversation
   * and the dispatcher should pass `--resume` instead of starting fresh.
   */
  get shouldResumePM(): boolean {
    return !!this.pmSessionId;
  }

  /**
   * A compact transcript the PM can prepend when planning. Only used on
   * the PM's FIRST turn (no resume session yet) — after that the Claude
   * session itself carries the full history.
   */
  formatHistoryForPM(): string {
    if (this.shouldResumePM) return "";
    if (this.history.length === 0) return "";

    const entries = this.takeRecentEntries();
    if (entries.length === 0) return "";

    const lines = entries.map((m) => {
      const who =
        m.role === "user"
          ? "User"
          : m.role === "system"
            ? "System"
            : `Agent${m.agentRole ? ` (${m.agentRole})` : ""}`;
      return `${who}: ${truncate(m.content, MAX_ENTRY_CHARS)}`;
    });

    return [
      "## Conversation so far",
      "Below is the prior conversation in this thread. Use it for context — the current request follows after.",
      "",
      lines.join("\n\n"),
    ].join("\n");
  }

  /**
   * A preamble every worker agent receives on its first turn so it sees
   * the original user request and the PM's overall plan, not just its
   * isolated task prompt.
   */
  formatWorkerPreamble(planSummary: string | undefined): string {
    const parts: string[] = [];
    parts.push(
      `## Original user request\n\n${truncate(this.originalUserPrompt, 4_000)}`,
    );
    const summary = planSummary ?? this.latestPlanSummary;
    if (summary && summary.trim()) {
      parts.push(`## PM plan summary\n\n${truncate(summary, 2_000)}`);
    }
    return parts.join("\n\n---\n\n");
  }

  /** Build a new context with the PM session id filled in. Immutable — returns a copy. */
  withPMSession(sessionId: string): ConversationContext {
    return new ConversationContext({
      originalUserPrompt: this.originalUserPrompt,
      conversationId: this.conversationId,
      history: [...this.history],
      pmSessionId: sessionId,
      latestPlanSummary: this.latestPlanSummary,
    });
  }

  private takeRecentEntries(): ConversationMessage[] {
    const recent = this.history.slice(-MAX_HISTORY_ENTRIES);
    let total = 0;
    const kept: ConversationMessage[] = [];
    for (let i = recent.length - 1; i >= 0; i--) {
      const entry = recent[i];
      const size = Math.min(entry.content.length, MAX_ENTRY_CHARS);
      if (total + size > MAX_HISTORY_CHARS) break;
      total += size;
      kept.push(entry);
    }
    return kept.reverse();
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n... (truncated)";
}
