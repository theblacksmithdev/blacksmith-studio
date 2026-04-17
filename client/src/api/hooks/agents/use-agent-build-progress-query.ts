import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Fetches the current project build progress.
 */
export function useAgentBuildProgressQuery() {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.agentBuildProgress,
    queryFn: () => api.multiAgents.buildProgress(),
  });
}
