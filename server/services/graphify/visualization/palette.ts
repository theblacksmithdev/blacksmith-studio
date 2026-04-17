/**
 * Colour palette used to distinguish communities in the graph visualization.
 *
 * Colours are intentionally vivid against the dark background. Adding or
 * reordering entries is safe — the colourer wraps modulo palette length,
 * so communities beyond palette.length simply reuse earlier colours.
 */
export const COMMUNITY_PALETTE: readonly string[] = [
  "#4ade80",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
  "#10b981",
  "#6366f1",
  "#e11d48",
  "#0ea5e9",
];

/**
 * Assigns a stable colour to each community.
 *
 * Single Responsibility: community-id → colour mapping. Kept separate so
 * the mapping strategy can evolve (e.g. semantic colouring, user overrides)
 * without touching the HTML template or the generator orchestrator.
 */
export class CommunityColorer {
  private readonly colorByCommunity = new Map<number, string>();

  constructor(
    communityIds: readonly number[],
    private readonly palette: readonly string[] = COMMUNITY_PALETTE,
  ) {
    communityIds.forEach((id, i) => {
      this.colorByCommunity.set(id, this.palette[i % this.palette.length]);
    });
  }

  colorFor(community: number | undefined): string {
    return this.colorByCommunity.get(community ?? 0) ?? this.palette[0];
  }
}
