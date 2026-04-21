/**
 * Immutable value object for token usage from a single model turn.
 *
 * SRP: represent token counts and arithmetic over them. Persistence,
 * aggregation queries, and UI formatting live elsewhere.
 */
export class TokenUsage {
  readonly input: number;
  readonly output: number;
  readonly cacheRead: number;
  readonly cacheCreation: number;

  private constructor(
    input: number,
    output: number,
    cacheRead: number,
    cacheCreation: number,
  ) {
    this.input = input;
    this.output = output;
    this.cacheRead = cacheRead;
    this.cacheCreation = cacheCreation;
  }

  static empty(): TokenUsage {
    return new TokenUsage(0, 0, 0, 0);
  }

  static of(parts: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheCreation?: number;
  }): TokenUsage {
    return new TokenUsage(
      parts.input ?? 0,
      parts.output ?? 0,
      parts.cacheRead ?? 0,
      parts.cacheCreation ?? 0,
    );
  }

  /**
   * Parses a Claude CLI `result` event's `usage` block. Returns null when
   * the event has no usage payload (e.g. assistant/system events).
   */
  static fromResultEvent(event: unknown): TokenUsage | null {
    if (!event || typeof event !== "object") return null;
    const e = event as Record<string, unknown>;
    if (e.type !== "result") return null;
    const usage = e.usage as Record<string, unknown> | undefined;
    if (!usage) return null;
    return new TokenUsage(
      numberOr(usage.input_tokens, 0),
      numberOr(usage.output_tokens, 0),
      numberOr(usage.cache_read_input_tokens, 0),
      numberOr(usage.cache_creation_input_tokens, 0),
    );
  }

  /** Sum of input + output + cache tokens — the figure shown in the meter. */
  get total(): number {
    return this.input + this.output + this.cacheRead + this.cacheCreation;
  }

  get isEmpty(): boolean {
    return (
      this.input === 0 &&
      this.output === 0 &&
      this.cacheRead === 0 &&
      this.cacheCreation === 0
    );
  }

  add(other: TokenUsage): TokenUsage {
    return new TokenUsage(
      this.input + other.input,
      this.output + other.output,
      this.cacheRead + other.cacheRead,
      this.cacheCreation + other.cacheCreation,
    );
  }

  static sum(usages: readonly TokenUsage[]): TokenUsage {
    return usages.reduce((acc, u) => acc.add(u), TokenUsage.empty());
  }

  toJson(): {
    input: number;
    output: number;
    cacheRead: number;
    cacheCreation: number;
  } {
    return {
      input: this.input,
      output: this.output,
      cacheRead: this.cacheRead,
      cacheCreation: this.cacheCreation,
    };
  }
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
