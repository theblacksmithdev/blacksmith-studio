import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { SessionMeter, UsageScope } from "@/api/modules/usage";
import { useChannelEffect } from "../_shared";

/**
 * Live token meter for a single conversation unit (chat session or agent task).
 *
 * Contract:
 * - Initial value hydrated via `usage:getSessionMeter`.
 * - Live updates streamed over `usage:update`; the hook writes them
 *   straight into the query cache so every consumer re-renders.
 * - Disabled until a scopeId exists — components should always pass the
 *   current id, never call `api.usage.*` directly.
 */
export function useSessionMeter(
  scope: UsageScope,
  scopeId: string | null | undefined,
) {
  const queryClient = useQueryClient();
  const key = ["usage", "sessionMeter", scope, scopeId] as const;

  const query = useQuery<SessionMeter>({
    queryKey: key,
    queryFn: () => api.usage.getSessionMeter(scope, scopeId!),
    enabled: !!scopeId,
    staleTime: 30_000,
  });

  useChannelEffect("usage:update", (data) => {
    if (!scopeId) return;
    if (data.scope !== scope || data.scopeId !== scopeId) return;
    queryClient.setQueryData(key, data);
  });

  return query;
}
