import {
  useConversationEventsQuery,
  useConversationEventsSubscription,
} from "@/api/hooks/conversation-events";
import type { EventScope } from "@/api/types";
import { EventRow } from "./event-row";
import { EmptyState, TimelineRoot } from "./styles";

interface EventTimelineProps {
  scope: EventScope;
  conversationId: string | undefined;
  /**
   * When true, omit chat-surface message events (`user_message`,
   * `assistant_message`) that are already shown by the main chat
   * bubbles — the timeline then focuses on the trace layer (tools,
   * activities, task lifecycle, errors).
   */
  hideMessages?: boolean;
}

/**
 * DB-backed timeline of every conversation event. Source of truth is
 * the `conversation_events` table; the subscription hook keeps the
 * React Query cache in sync with live appends. Reloading the page
 * repaints the same view because the data is persisted.
 */
export function EventTimeline({
  scope,
  conversationId,
  hideMessages = false,
}: EventTimelineProps) {
  const { data, isLoading } = useConversationEventsQuery(scope, conversationId);
  useConversationEventsSubscription(scope, conversationId);

  if (!conversationId) {
    return <EmptyState>No conversation selected.</EmptyState>;
  }
  if (isLoading) {
    return <EmptyState>Loading timeline…</EmptyState>;
  }
  const events = (data ?? []).filter((e) =>
    hideMessages
      ? e.eventType !== "user_message" && e.eventType !== "assistant_message"
      : true,
  );
  if (events.length === 0) {
    return <EmptyState>No events yet.</EmptyState>;
  }

  return (
    <TimelineRoot>
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </TimelineRoot>
  );
}
