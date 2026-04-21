import { ANTHROPIC_FAMILIES, ANTHROPIC_MODELS } from "./anthropic.js";
import { OPENAI_FAMILIES, OPENAI_MODELS } from "./openai.js";
import { GOOGLE_FAMILIES, GOOGLE_MODELS } from "./google.js";

export type { ModelEntry, FamilyDefault } from "./types.js";
export { FALLBACK_CONTEXT_WINDOW } from "./types.js";

/**
 * Single aggregated view of every provider's models. Order mirrors
 * provider import order so pickers show them grouped.
 *
 * Adding a provider: create a new file in this folder with its
 * `XXX_MODELS` + `XXX_FAMILIES` arrays, then append both here.
 */
export const MODEL_REGISTRY = [
  ...ANTHROPIC_MODELS,
  ...OPENAI_MODELS,
  ...GOOGLE_MODELS,
] as const;

export const FAMILY_DEFAULTS = [
  ...ANTHROPIC_FAMILIES,
  ...OPENAI_FAMILIES,
  ...GOOGLE_FAMILIES,
] as const;
