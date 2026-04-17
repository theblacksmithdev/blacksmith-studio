import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Fetches the list of available agents.
 */
export function useAgentsListQuery() {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.agents,
    queryFn: () => api.multiAgents.list(),
  });
}
