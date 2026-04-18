import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ConversationEvent, EventScope } from "@/api/types";
import { useProjectKeys } from "../_shared";

/**
 * Subscribes to the unified conversation-events append stream and
 * merges matching events into the React Query cache keyed by
 * `(scope, conversationId)`. Merge is idempotent (dedup by event id,
 * ordered by sequence) so out-of-order delivery doesn't double-render.
 *
 * Reload fidelity: the query hydrates from the DB; this hook keeps
 * the cache in sync with in-flight appends. After a reload, the next
 * query refetch reads all events including the ones that arrived
 * while this hook was unmounted.
 */
export function useConversationEventsSubscription(
  scope: EventScope,
  conversationId: string | undefined,
): void {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  useEffect(() => {
    if (!conversationId) return;
    const key = keys.conversationEvents(scope, conversationId);

    const unsubscribe = api.conversationEvents.onAppend(
      (event: ConversationEvent) => {
        if (event.scope !== scope || event.conversationId !== conversationId) {
          return;
        }
        queryClient.setQueryData<ConversationEvent[]>(key, (prev) => {
          const existing = prev ?? [];
          if (existing.some((e) => e.id === event.id)) return existing;
          const next = [...existing, event];
          next.sort((a, b) => a.sequence - b.sequence);
          return next;
        });
      },
    );
    return unsubscribe;
  }, [queryClient, keys, scope, conversationId]);
}
