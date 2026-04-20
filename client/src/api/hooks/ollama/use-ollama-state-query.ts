import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/**
 * Snapshot of Ollama install + daemon state. Re-queried on demand
 * (e.g. after install or after the daemon status channel fires).
 */
export function useOllamaStateQuery() {
  return useQuery({
    queryKey: queryKeys.ollamaState,
    queryFn: () => api.ollama.state(),
  });
}
