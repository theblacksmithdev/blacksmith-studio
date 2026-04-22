import type { Pricing } from "../ai/models/types.js";
import type { TokenBreakdown } from "./types.js";

/**
 * Compute USD cost for a token breakdown at a specific model's pricing.
 *
 * Returns 0 when pricing is missing (unknown model) — callers treat
 * "unknown cost" the same as "free" for display purposes. The only
 * alternative — hiding rows with unknown pricing — would drop real
 * activity from the books.
 */
export function costOfBreakdown(
  tokens: TokenBreakdown,
  pricing: Pricing | undefined,
): number {
  if (!pricing) return 0;
  const cacheRead = pricing.cacheRead ?? pricing.input * 0.1;
  const cacheCreation = pricing.cacheCreation ?? pricing.input * 1.25;
  const m = 1_000_000;
  return (
    (tokens.input * pricing.input) / m +
    (tokens.output * pricing.output) / m +
    (tokens.cacheRead * cacheRead) / m +
    (tokens.cacheCreation * cacheCreation) / m
  );
}
