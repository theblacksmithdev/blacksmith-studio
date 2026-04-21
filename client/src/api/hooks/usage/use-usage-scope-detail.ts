import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { HistoryScope, ScopeDetail } from "@/api/modules/usage";

/**
 * Drill-down for one chat session or agent dispatch. Deferred until the
 * user expands the row — `enabled` keys off scopeId presence so the
 * query only fires when there's a target.
 */
export function useUsageScopeDetail(
  scope: HistoryScope,
  scopeId: string | null | undefined,
) {
  return useQuery<ScopeDetail>({
    queryKey: ["usage", "scopeDetail", scope, scopeId] as const,
    queryFn: () => api.usage.getScopeDetail(scope, scopeId!),
    enabled: !!scopeId,
    staleTime: 30_000,
  });
}
