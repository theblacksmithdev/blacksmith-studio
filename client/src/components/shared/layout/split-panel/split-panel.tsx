import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { Flex, Box } from "@chakra-ui/react";

export type SplitDirection = "horizontal" | "vertical";

/**
 * A size bound on the split panel's fixed side.
 *
 * - `number` — pixels, the simple + original form.
 * - `string` — a percentage of the split container's width/height,
 *   e.g. `"75%"`. Resolved against the container's measured dimension
 *   on mount and on resize. Anything else is treated as `NaN`.
 */
export type SplitSize = number | string;

interface SplitPanelProps {
  left: ReactNode;
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: SplitSize;
  maxWidth?: SplitSize;
  storageKey?: string;
  direction?: SplitDirection;
  reverse?: boolean;
  open?: boolean;
}

const OPEN_CLOSE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const OPEN_CLOSE_DURATION = 220;

/** Fallback used when the container hasn't measured yet. */
const HARD_FLOOR = 0;
const HARD_CEILING = 100_000;

function parsePercent(value: string): number | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*%$/);
  if (!match) return null;
  const pct = parseFloat(match[1]);
  if (!Number.isFinite(pct)) return null;
  return pct / 100;
}

function resolveSize(
  bound: SplitSize | undefined,
  containerSize: number,
  fallback: number,
): number {
  if (bound === undefined) return fallback;
  if (typeof bound === "number") return bound;
  const pct = parsePercent(bound);
  if (pct == null || containerSize <= 0) return fallback;
  return Math.round(containerSize * pct);
}

function loadInitialSize(
  storageKey: string | undefined,
  defaultWidth: number,
): number {
  if (!storageKey) return defaultWidth;
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultWidth;
  const n = parseInt(saved, 10);
  return Number.isFinite(n) ? n : defaultWidth;
}

export function SplitPanel({
  left,
  children,
  defaultWidth = 260,
  minWidth = 160,
  maxWidth = 480,
  storageKey,
  direction = "horizontal",
  reverse = false,
  open = true,
}: SplitPanelProps) {
  const isVertical = direction === "vertical";
  const sizeDimension: "width" | "height" = isVertical ? "height" : "width";

  const [committedSize, setCommittedSize] = useState(() =>
    loadInitialSize(storageKey, defaultWidth),
  );
  const [dragging, setDragging] = useState(false);
  const [containerSize, setContainerSize] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const fixedPanelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ pos: 0, size: 0 });
  const liveSizeRef = useRef(committedSize);
  const rafRef = useRef<number | null>(null);

  // Resolved pixel bounds — recomputed whenever the container resizes or
  // the caller supplies new percentage strings.
  const { resolvedMin, resolvedMax } = useMemo(() => {
    const min = resolveSize(minWidth, containerSize, HARD_FLOOR);
    const max = resolveSize(maxWidth, containerSize, HARD_CEILING);
    return {
      resolvedMin: Math.max(0, min),
      resolvedMax: Math.max(min, max),
    };
  }, [minWidth, maxWidth, containerSize]);

  // Track container size so percentage bounds stay accurate on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize(isVertical ? rect.height : rect.width);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVertical]);

  // Clamp the committed size whenever bounds shift — the user shouldn't
  // end up with a persisted size that falls outside the current min/max
  // after a percentage-based bound resolves or the window resizes.
  useEffect(() => {
    setCommittedSize((s) => {
      const clamped = Math.max(resolvedMin, Math.min(resolvedMax, s));
      return clamped === s ? s : clamped;
    });
  }, [resolvedMin, resolvedMax]);

  useEffect(() => {
    if (!dragging) liveSizeRef.current = committedSize;
  }, [committedSize, dragging]);

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, String(committedSize));
  }, [committedSize, storageKey]);

  const scheduleDragSizeUpdate = useCallback(
    (next: number) => {
      liveSizeRef.current = next;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = fixedPanelRef.current;
        if (!el) return;
        el.style[sizeDimension] = `${liveSizeRef.current}px`;
      });
    },
    [sizeDimension],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      draggingRef.current = true;
      setDragging(true);
      startRef.current = {
        pos: isVertical ? e.clientY : e.clientX,
        size: liveSizeRef.current,
      };
    },
    [isVertical],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const raw = (isVertical ? e.clientY : e.clientX) - startRef.current.pos;
      const delta = reverse ? -raw : raw;
      const next = Math.max(
        resolvedMin,
        Math.min(resolvedMax, startRef.current.size + delta),
      );
      scheduleDragSizeUpdate(next);
    },
    [isVertical, reverse, resolvedMin, resolvedMax, scheduleDragSizeUpdate],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const el = fixedPanelRef.current;
      if (el) el.style[sizeDimension] = "";
      setDragging(false);
      setCommittedSize(liveSizeRef.current);
    },
    [sizeDimension],
  );

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const renderedSize = open ? committedSize : 0;

  const fixedPanel = (
    <Box
      ref={fixedPanelRef}
      css={{
        flexShrink: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        [sizeDimension]: renderedSize,
        transition: dragging
          ? "none"
          : `${sizeDimension} ${OPEN_CLOSE_DURATION}ms ${OPEN_CLOSE_EASING}`,
      }}
    >
      {reverse ? children : left}
    </Box>
  );

  const flexPanel = (
    <Box
      css={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {reverse ? left : children}
    </Box>
  );

  const separator = (
    <Box
      aria-hidden={!open}
      css={{
        position: "relative",
        flexShrink: 0,
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: dragging
          ? "none"
          : `opacity ${OPEN_CLOSE_DURATION}ms ${OPEN_CLOSE_EASING}, border-color 0.15s ease`,
        ...(isVertical
          ? {
              width: "100%",
              height: 0,
              borderTop: `1px solid ${
                dragging ? "var(--studio-border-hover)" : "var(--studio-border)"
              }`,
            }
          : {
              height: "100%",
              width: 0,
              borderLeft: `1px solid ${
                dragging ? "var(--studio-border-hover)" : "var(--studio-border)"
              }`,
            }),
      }}
    >
      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        css={{
          position: "absolute",
          zIndex: 2,
          touchAction: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(isVertical
            ? {
                left: 0,
                right: 0,
                top: "-5px",
                height: "9px",
                cursor: "row-resize",
              }
            : {
                top: 0,
                bottom: 0,
                left: "-5px",
                width: "9px",
                cursor: "col-resize",
              }),
          "&:hover .split-knob": { opacity: 1 },
        }}
      >
        <Box
          className="split-knob"
          css={{
            borderRadius: "4px",
            background: dragging
              ? "var(--studio-text-muted)"
              : "var(--studio-border-hover)",
            opacity: dragging ? 1 : 0,
            transition: "opacity 0.15s ease",
            ...(isVertical
              ? { width: "32px", height: "4px" }
              : { width: "4px", height: "32px" }),
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Flex
      ref={containerRef}
      direction={isVertical ? "column" : "row"}
      css={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        ...(dragging
          ? {
              userSelect: "none",
              cursor: isVertical ? "row-resize" : "col-resize",
            }
          : {}),
      }}
    >
      {reverse ? flexPanel : fixedPanel}
      {separator}
      {reverse ? fixedPanel : flexPanel}
    </Flex>
  );
}
