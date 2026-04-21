/**
 * Typed catalog of models this app can invoke.
 *
 * SRP: static model metadata. No runtime parsing/matching logic —
 * that lives in `resolve-model.ts`. Callers lookup here for:
 *   - context window size
 *   - friendly label for UI
 *   - provider routing (later)
 *   - pricing (future, tokens-only for v1)
 *
 * Extending: add a new entry. The resolver's family-prefix fallback
 * means unknown-but-similar models (e.g. a future `claude-opus-5-0`)
 * still render a sensible label without a code change — updates to this
 * file are "nice to have" rather than "required for the app to work".
 */

import type { AiProviderId } from "./provider-id.js";

/** Canonical metadata for one model. */
export interface ModelEntry {
  /** Canonical id without date or variant suffix, lower-case. */
  id: string;
  /** Alternate strings that resolve to this entry (CLI aliases, tier names). */
  aliases: string[];
  provider: AiProviderId;
  family: string;
  version: string;
  contextWindow: number;
  maxOutputTokens?: number;
  /** Present on extended-context variants — "1m" for Claude's 1M option. */
  variant?: "1m";
  /** Rendered on chips and meters. */
  label: string;
}

const k = 1_000;
const m = 1_000_000;

/** Authoritative table. Ordered family-first for readability. */
export const MODEL_REGISTRY: readonly ModelEntry[] = [
  // ── Anthropic · Claude 4.x ──
  {
    id: "claude-opus-4-7",
    aliases: ["opus", "claude-opus-4-7-latest"],
    provider: "anthropic",
    family: "Opus",
    version: "4.7",
    contextWindow: 200 * k,
    maxOutputTokens: 64 * k,
    label: "Opus 4.7",
  },
  {
    id: "claude-opus-4-7-1m",
    aliases: ["claude-opus-4-7[1m]", "opus-1m"],
    provider: "anthropic",
    family: "Opus",
    version: "4.7",
    contextWindow: 1 * m,
    maxOutputTokens: 64 * k,
    variant: "1m",
    label: "Opus 4.7 · 1M",
  },
  {
    id: "claude-opus-4-5",
    aliases: ["claude-opus-4-5-latest"],
    provider: "anthropic",
    family: "Opus",
    version: "4.5",
    contextWindow: 200 * k,
    label: "Opus 4.5",
  },
  {
    id: "claude-sonnet-4-6",
    aliases: ["sonnet", "claude-sonnet-4-6-latest"],
    provider: "anthropic",
    family: "Sonnet",
    version: "4.6",
    contextWindow: 200 * k,
    maxOutputTokens: 64 * k,
    label: "Sonnet 4.6",
  },
  {
    id: "claude-sonnet-4-6-1m",
    aliases: ["claude-sonnet-4-6[1m]", "sonnet-1m"],
    provider: "anthropic",
    family: "Sonnet",
    version: "4.6",
    contextWindow: 1 * m,
    variant: "1m",
    label: "Sonnet 4.6 · 1M",
  },
  {
    id: "claude-haiku-4-5",
    aliases: ["haiku", "claude-haiku-4-5-latest"],
    provider: "anthropic",
    family: "Haiku",
    version: "4.5",
    contextWindow: 200 * k,
    label: "Haiku 4.5",
  },

  // ── OpenAI placeholders (providers plug in the same way) ──
  {
    id: "gpt-4o",
    aliases: ["gpt-4o-latest"],
    provider: "openai",
    family: "GPT-4o",
    version: "latest",
    contextWindow: 128 * k,
    label: "GPT-4o",
  },
  {
    id: "gpt-5",
    aliases: ["gpt-5-latest"],
    provider: "openai",
    family: "GPT-5",
    version: "latest",
    contextWindow: 400 * k,
    label: "GPT-5",
  },

  // ── Google ──
  {
    id: "gemini-2-5-pro",
    aliases: ["gemini-pro"],
    provider: "google",
    family: "Gemini",
    version: "2.5 Pro",
    contextWindow: 1 * m,
    label: "Gemini 2.5 Pro",
  },
];

/** Default window when a model is wholly unknown. */
export const FALLBACK_CONTEXT_WINDOW = 200 * k;

/**
 * Family defaults — used by the resolver's fallback path when we
 * recognise the family (claude-opus-*) but not the exact version.
 * Keeps the app forward-compatible with unreleased model IDs.
 */
export interface FamilyDefault {
  provider: AiProviderId;
  family: string;
  contextWindow: number;
  /** Regex fragment that captures the family stem. Full ID is lower-cased first. */
  pattern: RegExp;
}

export const FAMILY_DEFAULTS: readonly FamilyDefault[] = [
  {
    provider: "anthropic",
    family: "Opus",
    contextWindow: 200 * k,
    pattern: /^claude-opus(?:-(\d+)-(\d+))?/,
  },
  {
    provider: "anthropic",
    family: "Sonnet",
    contextWindow: 200 * k,
    pattern: /^claude-sonnet(?:-(\d+)-(\d+))?/,
  },
  {
    provider: "anthropic",
    family: "Haiku",
    contextWindow: 200 * k,
    pattern: /^claude-haiku(?:-(\d+)-(\d+))?/,
  },
  {
    provider: "openai",
    family: "GPT",
    contextWindow: 128 * k,
    pattern: /^gpt-/,
  },
  {
    provider: "google",
    family: "Gemini",
    contextWindow: 1 * m,
    pattern: /^gemini-/,
  },
];
