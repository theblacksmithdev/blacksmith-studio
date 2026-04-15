import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/**
 * Detects Node.js installations on the system.
 * Global query — not project-scoped.
 */
export function useDetectNodeQuery() {
  return useQuery({
    queryKey: queryKeys.nodeInstallations,
    queryFn: () => api.runner.detectNode(),
    staleTime: Infinity,
  });
}
