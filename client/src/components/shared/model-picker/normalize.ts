import type { ModelEntry } from "@/api/modules/ai";

/**
 * Map an arbitrary stored model string to its canonical id by scanning
 * the live registry. If the value is already a canonical id, returns it
 * unchanged. If it's an alias (`sonnet`, `opus`, `haiku`, dated id, etc.)
 * returns the matching entry's canonical id. Unknown values fall through.
 *
 * Used at the read boundary so old persisted settings values "just work"
 * with the new picker without needing a schema or DB migration.
 */
export function normalizeModelId(
  stored: string | null | undefined,
  models: ModelEntry[] | undefined,
): string {
  if (!stored) return "";
  if (!models || models.length === 0) return stored;

  const lower = stored.toLowerCase().trim();
  for (const m of models) {
    if (m.id === lower) return m.id;
    if (m.aliases.includes(lower)) return m.id;
  }
  return stored;
}
