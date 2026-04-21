import type { AiProviderId } from "./provider-id.js";
import {
  FALLBACK_CONTEXT_WINDOW,
  FAMILY_DEFAULTS,
  MODEL_REGISTRY,
  type ModelEntry,
} from "./model-registry.js";

/**
 * Result of resolving a raw model string — always a concrete shape
 * with a usable label + window, even for ids we don't know.
 */
export interface ResolvedModel {
  /** Raw input, lowercased. */
  input: string;
  /** Core id with date and variant suffixes stripped. */
  normalized: string;
  provider: AiProviderId;
  family: string;
  version: string | null;
  contextWindow: number;
  variant: "1m" | null;
  label: string;
  /** True when we found an exact entry in the registry. */
  known: boolean;
}

const DATE_SUFFIX = /-(\d{8}|\d{4}-\d{2}-\d{2}|\d{6})$/;
const VARIANT_BRACKET = /\[(\d+m)\]$/i;
const VARIANT_SUFFIX = /-(\d+m)$/i;

/**
 * Parse a raw model identifier into a concrete ResolvedModel.
 *
 * Pipeline:
 *   1. Lowercase + trim.
 *   2. Strip date suffix (`-20260115`, `-2026-01-15`).
 *   3. Peel off variant marker (`[1m]` or `-1m`) — remember it.
 *   4. Exact match against registry id.
 *   5. Alias match.
 *   6. If we stripped a variant, retry with `${stem}-${variant}` as id
 *      so explicit variant entries win over their base entries.
 *   7. Family-prefix fallback — recognises unknown versions within
 *      known families (e.g. a future `claude-opus-5-0`) so the UI
 *      still renders a sensible label.
 *   8. Unknown — returns a shape with FALLBACK_CONTEXT_WINDOW so
 *      callers never crash on null.
 */
export function resolveModel(rawId: string | null | undefined): ResolvedModel {
  const input = (rawId ?? "").toLowerCase().trim();
  if (!input) return unknownModel(input, input);

  const { stem, variant } = peelVariant(stripDate(input));

  // 4. Exact id / 5. alias match on variant-bearing id (preferred)
  if (variant) {
    const variantId = `${stem}-${variant}`;
    const withVariant = lookupExact(variantId);
    if (withVariant) return toResolved(variantId, withVariant);
  }

  // 4-5. Exact id / alias match on base stem
  const baseHit = lookupExact(stem);
  if (baseHit)
    return applyVariantToKnown(stem, baseHit, variant);

  // 7. Family fallback
  const familyHit = lookupFamily(stem);
  if (familyHit)
    return fromFamily(stem, familyHit, variant);

  return unknownModel(input, stem);
}

function stripDate(id: string): string {
  return id.replace(DATE_SUFFIX, "");
}

function peelVariant(id: string): { stem: string; variant: "1m" | null } {
  const bracket = id.match(VARIANT_BRACKET);
  if (bracket) {
    const v = bracket[1].toLowerCase();
    if (v === "1m")
      return { stem: id.replace(VARIANT_BRACKET, ""), variant: "1m" };
  }
  const suffix = id.match(VARIANT_SUFFIX);
  if (suffix) {
    const v = suffix[1].toLowerCase();
    if (v === "1m")
      return { stem: id.replace(VARIANT_SUFFIX, ""), variant: "1m" };
  }
  return { stem: id, variant: null };
}

function lookupExact(id: string): ModelEntry | null {
  for (const entry of MODEL_REGISTRY) {
    if (entry.id === id) return entry;
    if (entry.aliases.includes(id)) return entry;
  }
  return null;
}

function lookupFamily(id: string): {
  provider: AiProviderId;
  family: string;
  contextWindow: number;
  version: string | null;
} | null {
  for (const fam of FAMILY_DEFAULTS) {
    const match = id.match(fam.pattern);
    if (!match) continue;
    const major = match[1];
    const minor = match[2];
    const version = major && minor ? `${major}.${minor}` : null;
    return {
      provider: fam.provider,
      family: fam.family,
      contextWindow: fam.contextWindow,
      version,
    };
  }
  return null;
}

function toResolved(normalized: string, entry: ModelEntry): ResolvedModel {
  return {
    input: normalized,
    normalized,
    provider: entry.provider,
    family: entry.family,
    version: entry.version,
    contextWindow: entry.contextWindow,
    variant: entry.variant ?? null,
    label: entry.label,
    known: true,
  };
}

function applyVariantToKnown(
  normalized: string,
  entry: ModelEntry,
  variant: "1m" | null,
): ResolvedModel {
  if (!variant) return toResolved(normalized, entry);
  // Base entry matched, caller specified a variant. Prefer a
  // registered variant entry for the same family+version if present;
  // otherwise synthesise a 1M-window override on the base entry.
  const variantEntry = MODEL_REGISTRY.find(
    (e) =>
      e.family === entry.family &&
      e.version === entry.version &&
      e.variant === variant,
  );
  if (variantEntry) return toResolved(variantEntry.id, variantEntry);

  return {
    input: normalized,
    normalized: `${entry.id}-${variant}`,
    provider: entry.provider,
    family: entry.family,
    version: entry.version,
    contextWindow: variant === "1m" ? 1_000_000 : entry.contextWindow,
    variant,
    label: `${entry.label} · ${variant.toUpperCase()}`,
    known: false,
  };
}

function fromFamily(
  normalized: string,
  fam: ReturnType<typeof lookupFamily> & {},
  variant: "1m" | null,
): ResolvedModel {
  const label = fam.version ? `${fam.family} ${fam.version}` : fam.family;
  return {
    input: normalized,
    normalized,
    provider: fam.provider,
    family: fam.family,
    version: fam.version,
    contextWindow: variant === "1m" ? 1_000_000 : fam.contextWindow,
    variant,
    label: variant ? `${label} · ${variant.toUpperCase()}` : label,
    known: false,
  };
}

function unknownModel(input: string, normalized: string): ResolvedModel {
  return {
    input,
    normalized,
    provider: "unknown",
    family: "Unknown",
    version: null,
    contextWindow: FALLBACK_CONTEXT_WINDOW,
    variant: null,
    label: normalized || "Unknown model",
    known: false,
  };
}
