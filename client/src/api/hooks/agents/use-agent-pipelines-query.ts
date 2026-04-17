import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Fetches available pipeline templates.
 */
export function useAgentPipelinesQuery() {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.agentPipelines,
    queryFn: () => api.multiAgents.listPipelines(),
  });
}
