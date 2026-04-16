export type GraphStatusLabel = "ok" | "stale" | "missing" | "building";

export function getGraphStatus(
  graphStatus: { exists: boolean; stale: boolean } | undefined,
  isBuilding: boolean,
): { label: GraphStatusLabel; text: string } {
  if (isBuilding) return { label: "building", text: "Building graph..." };
  if (!graphStatus?.exists)
    return { label: "missing", text: "No graph built yet" };
  if (graphStatus.stale) return { label: "stale", text: "Graph is stale" };
  return { label: "ok", text: "Graph up to date" };
}