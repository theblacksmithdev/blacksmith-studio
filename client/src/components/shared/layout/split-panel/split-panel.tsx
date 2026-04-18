import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { Flex, Box } from "@chakra-ui/react";

export type SplitDirection = "horizontal" | "vertical";

interface SplitPanelProps {
  left: ReactNode;
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  direction?: SplitDirection;
  reverse?: boolean;
  open?: boolean;
}

const OPEN_CLOSE_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const OPEN_CLOSE_DURATION = 220;

function loadInitialSize(
  storageKey: string | undefined,
  defaultWidth: number,
  minWidth: number,
  maxWidth: number,
): number {
  if (!storageKey) return defaultWidth;
  const saved = localStorage.getItem(storageKey);
  if (!saved) return defaultWidth;
  const n = parseInt(saved, 10);
  if (isNaN(n) || n < minWidth || n > maxWidth) return defaultWidth;
  return n;
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
    loadInitialSize(storageKey, defaultWidth, minWidth, maxWidth),
  );
  const [dragging, setDragging] = useState(false);

  const fixedPanelRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ pos: 0, size: 0 });
  const liveSizeRef = useRef(committedSize);
  const rafRef = useRef<number | null>(null);

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
        minWidth,
        Math.min(maxWidth, startRef.current.size + delta),
      );
      scheduleDragSizeUpdate(next);
    },
    [isVertical, reverse, minWidth, maxWidth, scheduleDragSizeUpdate],
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
