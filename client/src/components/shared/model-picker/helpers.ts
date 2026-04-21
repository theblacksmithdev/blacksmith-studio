import type { ModelEntry } from "@/api/modules/ai";

export function formatWindow(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

/**
 * Grouping for the picker UI: one bucket per family, version-ordered.
 * Preserves registry order within each family so base entries come
 * before their 1M variants.
 */
export interface ModelGroup {
  family: string;
  entries: ModelEntry[];
}

export function groupByFamily(models: ModelEntry[]): ModelGroup[] {
  const byFamily = new Map<string, ModelEntry[]>();
  for (const m of models) {
    const list = byFamily.get(m.family) ?? [];
    list.push(m);
    byFamily.set(m.family, list);
  }
  return Array.from(byFamily.entries()).map(([family, entries]) => ({
    family,
    entries,
  }));
}
