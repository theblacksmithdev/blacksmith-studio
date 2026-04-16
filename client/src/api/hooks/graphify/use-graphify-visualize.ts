import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the visualization HTML content for the current project.
 * Returns null if no visualization is available.
 * Only enabled when the project has a graph built.
 */
export function useGraphifyVisualize(enabled = true) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.graphifyVisualization,
    queryFn: () => api.graphify.getVisualizationUrl(projectId!),
    enabled: !!projectId && enabled,
    staleTime: 5 * 60_000,
  });
}
