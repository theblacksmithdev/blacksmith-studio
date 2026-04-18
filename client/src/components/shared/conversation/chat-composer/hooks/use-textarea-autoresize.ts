import { useCallback, useEffect, type RefObject } from "react";

const DEFAULT_MAX = 450;

export function useTextareaAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight: number = DEFAULT_MAX,
) {
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [ref, maxHeight]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.height = "auto";
  }, [ref]);

  return { resize, reset };
}
