import { useCallback } from "react";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Returns a function that fetches the visualization URL for the current project.
 * Returns null if no visualization is available.
 */
export function useGraphifyVisualize() {
  const projectId = useActiveProjectId();

  return useCallback(async (): Promise<string | null> => {
    if (!projectId) return null;
    return api.graphify.getVisualizationUrl(projectId);
  }, [projectId]);
}
