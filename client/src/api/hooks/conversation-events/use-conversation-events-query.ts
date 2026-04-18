import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { EventScope } from "@/api/types";
import { useProjectKeys } from "../_shared";

/**
 * Loads the full conversation event log for a chat so the UI can
 * reconstruct its timeline exactly as it streamed live. Paired with
 * `useConversationEventsSubscription` to merge live appends into the
 * same cache entry.
 */
export function useConversationEventsQuery(
  scope: EventScope,
  conversationId: string | undefined,
) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: conversationId
      ? keys.conversationEvents(scope, conversationId)
      : (["conversationEvents", "disabled"] as const),
    queryFn: () =>
      api.conversationEvents.list({
        scope,
        conversationId: conversationId!,
      }),
    enabled: !!conversationId,
  });
}
