import { useRef, useEffect } from "react";

/**
 * Auto-scrolls to the bottom of a container when dependencies change.
 * Returns a ref to attach to the bottom sentinel element.
 *
 * Only scrolls if the user is already near the bottom (within 150px),
 * so it doesn't hijack scroll position when the user is reading earlier content.
 * Uses requestAnimationFrame to defer scroll until after paint.
 */
export function useAutoScroll(deps: unknown[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = bottomRef.current;
      if (!el) return;

      const scrollParent = el.closest("[data-scroll-container]") as HTMLElement;
      if (!scrollParent) {
        // Fallback: just scroll
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // Only auto-scroll if user is near the bottom (within 150px)
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
