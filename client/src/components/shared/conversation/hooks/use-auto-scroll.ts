import { useRef, useEffect } from "react";

/**
 * Auto-scrolls to the bottom of a container when dependencies change.
 * Returns a ref to attach to the bottom sentinel element.
 */
export function useAutoScroll(deps: unknown[]) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return bottomRef;
}
