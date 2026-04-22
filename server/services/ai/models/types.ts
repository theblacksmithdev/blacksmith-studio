import type { AiProviderId } from "../provider-id.js";

/**
 * Per-million-token USD pricing.
 *
 * `cacheRead` defaults to 10% of input and `cacheCreation` to 125% of
 * input — Anthropic's standard prompt-caching rule — when a model
 * omits explicit values. Providers that price caching differently can
 * override.
 */
export interface Pricing {
  input: number;
  output: number;
  cacheRead?: number;
  cacheCreation?: number;
}

/**
 * Canonical metadata for one model. Static data — no runtime state.
 *
 * Adding a model: append an entry to the appropriate provider file
 * (e.g. `anthropic.ts`). Every field is required unless marked
 * optional; the resolver's family-prefix fallback means unknown
 * versions within known families still render sensibly without you
 * touching the registry at all.
 */
export interface ModelEntry {
  /** Canonical id, lower-case (matches the provider's API alias form). */
  id: string;
  /** Alternate strings that should resolve to this entry (short aliases, dated ids). */
  aliases: string[];
  provider: AiProviderId;
  family: string;
  version: string;
  contextWindow: number;
  maxOutputTokens?: number;
  /** Present on extended-context variants. */
  variant?: "1m";
  /** Rendered on chips and meters. */
  label: string;
  /** Per-MTok USD pricing. Optional so unknown-family entries don't lie. */
  pricing?: Pricing;
}

/**
 * Family fallback — used by the resolver when it recognises the family
 * (`claude-opus-*`) but not the exact version. Keeps the app
 * forward-compatible with unreleased model ids.
 */
export interface FamilyDefault {
  provider: AiProviderId;
  family: string;
  contextWindow: number;
  /** Captures the family stem. Full id is lower-cased first. */
  pattern: RegExp;
}

/** Default window when a model is wholly unknown. */
export const FALLBACK_CONTEXT_WINDOW = 200_000;

/** Common token unit helpers — shared across provider files. */
export const K = 1_000;
export const M = 1_000_000;
