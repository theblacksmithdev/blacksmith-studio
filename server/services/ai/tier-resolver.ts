import { MODEL_REGISTRY } from "./models/index.js";

/**
 * PM-assigned capability tier. Kept as a separate concept from concrete
 * model ids so the PM dispatcher can reason about "premium" vs "fast"
 * without caring which version is current. User-facing picks always use
 * concrete ids.
 */
export type TaskTier = "premium" | "balanced" | "fast";

const TIER_TO_FAMILY: Record<TaskTier, string> = {
  premium: "Opus",
  balanced: "Sonnet",
  fast: "Haiku",
};

/**
 * Resolves a PM-assigned tier to a concrete Anthropic model id by
 * reading the model registry.
 *
 * SRP: tier → model id. All model metadata (versions, windows, labels)
 * lives in the registry; this class is one mapping rule.
 *
 * Selection: latest version within the family, preferring the standard
 * entry over the 1M variant (so dispatches don't accidentally opt into
 * the extended-context pricing tier without being asked to).
 */
export class TierResolver {
  resolve(tier: TaskTier): string | null {
    const family = TIER_TO_FAMILY[tier];
    if (!family) return null;

    const candidates = MODEL_REGISTRY.filter(
      (m) => m.provider === "anthropic" && m.family === family,
    );
    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
      // Prefer non-variant entries.
      const aBase = a.variant ? 1 : 0;
      const bBase = b.variant ? 1 : 0;
      if (aBase !== bBase) return aBase - bBase;
      // Then latest version first.
      return compareVersion(b.version, a.version);
    });
    return candidates[0].id;
  }
}

export const tierResolver = new TierResolver();

function compareVersion(a: string, b: string): number {
  const parts = (s: string) => s.split(".").map((n) => Number(n) || 0);
  const [aMaj = 0, aMin = 0] = parts(a);
  const [bMaj = 0, bMin = 0] = parts(b);
  return aMaj - bMaj || aMin - bMin;
}
