import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Fetches agent execution history.
 */
export function useAgentHistoryQuery(limit?: number) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.agentHistory,
    queryFn: () => api.agents.history(limit),
  });
}
