import { useRef, useEffect } from "react";

/**
 * Keeps a chat view pinned to the latest message.
 *
 * - On initial mount (and whenever `resetKey` changes — e.g. the user
 *   opens a different conversation) jump instantly to the bottom so
 *   the view opens on the most recent messages.
 * - After that, auto-scroll only when the user is already near the
 *   bottom (within 150px) so we don't hijack their scroll position
 *   while they're reading earlier content.
 *
 * Pass `resetKey={conversationId}` to reset between conversations.
 */
export function useAutoScroll(deps: unknown[], resetKey?: unknown) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const lastResetKeyRef = useRef(resetKey);

  // Detect conversation switch during render — refs only, no state update.
  if (resetKey !== lastResetKeyRef.current) {
    initializedRef.current = false;
    lastResetKeyRef.current = resetKey;
  }

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = bottomRef.current;
      if (!el) return;

      const scrollParent = el.closest(
        "[data-scroll-container]",
      ) as HTMLElement | null;

      // First render (or conversation change): instant jump, skip guard.
      if (!initializedRef.current) {
        if (scrollParent) {
          scrollParent.scrollTop = scrollParent.scrollHeight;
        } else {
          el.scrollIntoView();
        }
        initializedRef.current = true;
        return;
      }

      if (!scrollParent) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const distanceFromBottom =
        scrollParent.scrollHeight -
        scrollParent.scrollTop -
        scrollParent.clientHeight;

      if (distanceFromBottom < 150) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return bottomRef;
}
