import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { UsageHistory } from "@/api/modules/usage";
import { useActiveProjectId, useChannelEffect } from "../_shared";

/**
 * Full usage history for the active project. Backed by an IPC query;
 * live assistant turns invalidate the key so the page refreshes itself
 * without manual polling.
 */
export function useUsageHistory() {
  const projectId = useActiveProjectId();
  const queryClient = useQueryClient();
  const key = ["usage", "history", projectId] as const;

  const query = useQuery<UsageHistory>({
    queryKey: key,
    queryFn: () => api.usage.getHistory(projectId!),
    enabled: !!projectId,
    staleTime: 15_000,
  });

  useChannelEffect("usage:update", () => {
    if (projectId) queryClient.invalidateQueries({ queryKey: key });
  });

  return query;
}
