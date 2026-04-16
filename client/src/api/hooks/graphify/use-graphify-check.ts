import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Checks if graphify CLI is installed. Global query (not project-scoped).
 */
export function useGraphifyCheck() {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.graphifyCheck,
    queryFn: () => api.graphify.check(),
    staleTime: 5 * 60_000, // cache for 5 minutes
  });
}
