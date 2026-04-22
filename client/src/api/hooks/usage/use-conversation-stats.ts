import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ConversationStats } from "@/api/modules/usage";
import { useChannelEffect } from "../_shared";

/**
 * Collective stats for one multi-agent conversation. Refetches when a
 * fresh `usage:update` fires (a new assistant turn closed somewhere).
 */
export function useConversationStats(
  conversationId: string | null | undefined,
) {
  const queryClient = useQueryClient();
  const key = ["usage", "conversationStats", conversationId] as const;

  const query = useQuery<ConversationStats>({
    queryKey: key,
    queryFn: () => api.usage.getConversationStats(conversationId!),
    enabled: !!conversationId,
    staleTime: 15_000,
  });

  useChannelEffect("usage:update", () => {
    if (conversationId) queryClient.invalidateQueries({ queryKey: key });
  });

  return query;
}
