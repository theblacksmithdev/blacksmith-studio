import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/**
 * Every AI provider the app has registered. Static per process — the
 * registry is built at main-process startup — so a long stale time is
 * safe and spares repeated IPC calls while the picker is mounted.
 */
export function useAiProvidersQuery() {
  return useQuery({
    queryKey: queryKeys.aiProviders,
    queryFn: () => api.ai.listProviders(),
    staleTime: Infinity,
  });
}
