import { useCallback } from "react";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Opens the Graphify graph visualization in the system browser.
 */
export function useGraphifyVisualize() {
  const projectId = useActiveProjectId();

  return useCallback(() => {
    if (projectId) api.graphify.openVisualization(projectId);
  }, [projectId]);
}
