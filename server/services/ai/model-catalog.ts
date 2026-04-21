/**
 * Maps a model id to its provider and context window.
 *
 * SRP: pure lookup. Persistence, pricing, and provider transport live
 * elsewhere. New providers plug in by extending the entries table — no
 * caller has to change.
 */

export type AiProviderId = "anthropic" | "openai" | "google" | "unknown";

export interface ModelInfo {
  id: string;
  provider: AiProviderId;
  /** Context window in tokens. */
  contextWindow: number;
  /** Friendly label for UI display (e.g. "Opus 4.7 · 1M"). */
  label: string;
}

interface ModelRule {
  match: (normalized: string) => boolean;
  info: Omit<ModelInfo, "id">;
}

const FALLBACK_CONTEXT_WINDOW = 200_000;

/**
 * Ordered rules. The first matching rule wins. Longer/more-specific
 * patterns come first so e.g. `[1m]` variants override the base family.
 */
const RULES: ModelRule[] = [
  {
    match: (m) => m.includes("[1m]") || m.endsWith("-1m"),
    info: {
      provider: "anthropic",
      contextWindow: 1_000_000,
      label: "Claude · 1M",
    },
  },
  {
    match: (m) => /claude-(opus|sonnet|haiku)/.test(m) || /^(opus|sonnet|haiku)$/.test(m),
    info: {
      provider: "anthropic",
      contextWindow: 200_000,
      label: "Claude",
    },
  },
  {
    match: (m) => m.startsWith("gpt-4o") || m.startsWith("gpt-4-turbo"),
    info: {
      provider: "openai",
      contextWindow: 128_000,
      label: "GPT-4",
    },
  },
  {
    match: (m) => m.startsWith("gpt-5"),
    info: {
      provider: "openai",
      contextWindow: 400_000,
      label: "GPT-5",
    },
  },
  {
    match: (m) => m.startsWith("gemini-"),
    info: {
      provider: "google",
      contextWindow: 1_000_000,
      label: "Gemini",
    },
  },
];

export class ModelCatalog {
  /**
   * Look up a model by its id. Unknown ids fall back to a default window
   * so the UI still renders a meter rather than crashing.
   */
  lookup(modelId: string | null | undefined): ModelInfo {
    const raw = (modelId ?? "").toLowerCase().trim();
    if (!raw) return this.unknown(raw);

    for (const rule of RULES) {
      if (rule.match(raw)) return { id: raw, ...rule.info };
    }
    return this.unknown(raw);
  }

  contextWindow(modelId: string | null | undefined): number {
    return this.lookup(modelId).contextWindow;
  }

  private unknown(raw: string): ModelInfo {
    return {
      id: raw,
      provider: "unknown",
      contextWindow: FALLBACK_CONTEXT_WINDOW,
      label: raw || "Unknown model",
    };
  }
}

export const modelCatalog = new ModelCatalog();
