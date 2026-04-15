import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Fetches a single dispatch by ID with its tasks.
 */
export function useAgentDispatchQuery(dispatchId: string | undefined) {
  return useQuery({
    queryKey: ["agents", "dispatch", dispatchId] as const,
    queryFn: () => api.agents.getDispatch(dispatchId!),
    enabled: !!dispatchId,
  });
}
