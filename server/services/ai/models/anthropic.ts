import { K, M, type FamilyDefault, type ModelEntry } from "./types.js";

/**
 * Anthropic Claude models. Numbers verified against the Anthropic
 * model overview (platform.claude.com/docs/en/about-claude/models/overview).
 *
 * Add a new model by appending an entry. The resolver picks exact
 * id → alias → family fallback in order, so new versions get a nice
 * label even before they land here.
 */
export const ANTHROPIC_MODELS: readonly ModelEntry[] = [
  // ── Opus ──
  {
    id: "claude-opus-4-7",
    aliases: ["opus", "claude-opus-4-7-latest"],
    provider: "anthropic",
    family: "Opus",
    version: "4.7",
    contextWindow: 1 * M,
    maxOutputTokens: 128 * K,
    label: "Opus 4.7",
  },
  {
    id: "claude-opus-4-6",
    aliases: ["claude-opus-4-6-latest"],
    provider: "anthropic",
    family: "Opus",
    version: "4.6",
    contextWindow: 1 * M,
    maxOutputTokens: 128 * K,
    label: "Opus 4.6",
  },
  {
    id: "claude-opus-4-5",
    aliases: ["claude-opus-4-5-20251101"],
    provider: "anthropic",
    family: "Opus",
    version: "4.5",
    contextWindow: 200 * K,
    maxOutputTokens: 64 * K,
    label: "Opus 4.5",
  },
  {
    id: "claude-opus-4-1",
    aliases: ["claude-opus-4-1-20250805"],
    provider: "anthropic",
    family: "Opus",
    version: "4.1",
    contextWindow: 200 * K,
    maxOutputTokens: 32 * K,
    label: "Opus 4.1",
  },

  // ── Sonnet ──
  {
    id: "claude-sonnet-4-6",
    aliases: ["sonnet", "claude-sonnet-4-6-latest"],
    provider: "anthropic",
    family: "Sonnet",
    version: "4.6",
    contextWindow: 1 * M,
    maxOutputTokens: 64 * K,
    label: "Sonnet 4.6",
  },
  {
    id: "claude-sonnet-4-5",
    aliases: ["claude-sonnet-4-5-20250929"],
    provider: "anthropic",
    family: "Sonnet",
    version: "4.5",
    contextWindow: 200 * K,
    maxOutputTokens: 64 * K,
    label: "Sonnet 4.5",
  },

  // ── Haiku ──
  {
    id: "claude-haiku-4-5",
    aliases: ["haiku", "claude-haiku-4-5-20251001"],
    provider: "anthropic",
    family: "Haiku",
    version: "4.5",
    contextWindow: 200 * K,
    maxOutputTokens: 64 * K,
    label: "Haiku 4.5",
  },
];

/**
 * Newer Opus and Sonnet releases ship 1M natively (Opus 4.6+, Sonnet
 * 4.6+); older variants were 200k. For unknown versions we default
 * to the current-generation window so future models light up correctly
 * until the explicit entry lands.
 */
export const ANTHROPIC_FAMILIES: readonly FamilyDefault[] = [
  {
    provider: "anthropic",
    family: "Opus",
    contextWindow: 1 * M,
    pattern: /^claude-opus(?:-(\d+)-(\d+))?/,
  },
  {
    provider: "anthropic",
    family: "Sonnet",
    contextWindow: 1 * M,
    pattern: /^claude-sonnet(?:-(\d+)-(\d+))?/,
  },
  {
    provider: "anthropic",
    family: "Haiku",
    contextWindow: 200 * K,
    pattern: /^claude-haiku(?:-(\d+)-(\d+))?/,
  },
];
