import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Fetches the list of past dispatches for the active project.
 */
export function useAgentDispatchesQuery(limit?: number) {
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: ["agents", projectId, "dispatches", limit] as const,
    queryFn: () => api.agents.listDispatches(projectId!, limit),
    enabled: !!projectId,
  });
}
