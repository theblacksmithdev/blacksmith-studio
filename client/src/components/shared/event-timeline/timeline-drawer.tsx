import { Drawer } from "@/components/shared/drawer";
import type { EventScope } from "@/api/types";
import { EventTimeline } from "./event-timeline";

interface TimelineDrawerProps {
  scope: EventScope;
  conversationId: string | undefined;
  onClose: () => void;
  hideMessages?: boolean;
}

/**
 * Drawer wrapper around `EventTimeline`. Reusable across single-agent
 * and multi-agent chats so the reload-fidelity view looks identical in
 * both surfaces.
 */
export function TimelineDrawer({
  scope,
  conversationId,
  onClose,
  hideMessages,
}: TimelineDrawerProps) {
  return (
    <Drawer title="Timeline" onClose={onClose} size="440px">
      <EventTimeline
        scope={scope}
        conversationId={conversationId}
        hideMessages={hideMessages}
      />
    </Drawer>
  );
}
