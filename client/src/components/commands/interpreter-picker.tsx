import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useInstalledVersionsQuery } from "@/api/hooks/commands";
import type { InstalledVersion } from "@/api/types";

/* ── Styles ──────────────────────────────────────────────── */

const PickerToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }
`;

const PopoverShell = styled.div`
  position: fixed;
  z-index: 1100;
  min-width: 280px;
  max-width: 360px;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  box-shadow: var(--studio-shadow-md, 0 14px 40px rgba(0, 0, 0, 0.32));
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
  animation: popIn 0.12s ease;

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Option = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: ${(p) =>
    p.$selected ? "var(--studio-bg-surface)" : "transparent"};
  color: var(--studio-text-primary);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
`;

const OptionPath = styled.span`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 10px;
  color: var(--studio-text-muted);
  word-break: break-all;
`;

const EmptyMsg = styled.div`
  padding: 14px 10px;
  text-align: center;
  font-size: 12px;
  color: var(--studio-text-muted);
`;

const Divider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 2px;
`;

const MutedAction = styled(Option)`
  color: var(--studio-text-muted);
  font-size: 12px;
`;

/* ── Component ───────────────────────────────────────────── */

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
}

export interface InterpreterPickerProps {
  toolchainId: string;
  /** Current interpreter path (when an env is resolved); used for the
   *  selected checkmark. */
  currentPath?: string;
  /** When the active env is an override (i.e. user pinned it), render
   *  a "Use auto-detection" action at the bottom. */
  hasOverride?: boolean;
  /** Trigger label; defaults to "Change". */
  label?: string;
  onSelect: (path: string) => void;
  onClearOverride?: () => void;
}

/**
 * Small popover that lists installed interpreters for a toolchain.
 *
 * The popover is rendered through `createPortal` into `document.body`
 * with `position: fixed`, so it escapes any parent stacking context
 * (drawer, modal, clipped overflow container) and always sits on top.
 * Position is recomputed against the trigger's viewport rect on
 * scroll and resize so it tracks the button even when the underlying
 * surface moves.
 */
export function InterpreterPicker({
  toolchainId,
  currentPath,
  hasOverride = false,
  label = "Change",
  onSelect,
  onClearOverride,
}: InterpreterPickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopoverPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { data: versions = [], isLoading } =
    useInstalledVersionsQuery(open ? toolchainId : undefined);

  const measure = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Right-align the popover with the trigger; `min-width` is bumped
    // to at least 280 so short triggers still produce a readable list.
    const MIN_WIDTH = 280;
    const GAP = 6;
    const width = Math.max(rect.width, MIN_WIDTH);
    let left = rect.right - width;
    if (left < 8) left = 8;
    setPos({ top: rect.bottom + GAP, left, width });
  }, []);

  // Recompute on open, scroll, resize.
  useLayoutEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  // Close on click outside either the trigger or the popover.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handlePick = (version: InstalledVersion) => {
    onSelect(version.path);
    setOpen(false);
  };

  const handleClear = () => {
    onClearOverride?.();
    setOpen(false);
  };

  return (
    <>
      <PickerToggle
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={11} />
      </PickerToggle>
      {open &&
        pos &&
        createPortal(
          <PopoverShell
            ref={popoverRef}
            style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
          >
            {isLoading ? (
              <EmptyMsg>Scanning for interpreters…</EmptyMsg>
            ) : versions.length === 0 ? (
              <EmptyMsg>
                No interpreters detected on this system. Install one or set
                the path in project settings.
              </EmptyMsg>
            ) : (
              versions.map((v) => {
                const selected = currentPath === v.path;
                return (
                  <Option
                    key={v.path}
                    $selected={selected}
                    onClick={() => handlePick(v)}
                  >
                    <OptionHeader>
                      {selected ? (
                        <Check
                          size={11}
                          style={{ color: "var(--studio-accent)" }}
                        />
                      ) : (
                        <span style={{ width: 11 }} />
                      )}
                      <span style={{ flex: 1 }}>{v.displayName}</span>
                      <span
                        style={{
                          fontFamily:
                            "var(--studio-font-mono, monospace)",
                          fontSize: 10,
                          color: "var(--studio-text-muted)",
                        }}
                      >
                        {v.version}
                      </span>
                    </OptionHeader>
                    <OptionPath>{v.path}</OptionPath>
                  </Option>
                );
              })
            )}
            {hasOverride && onClearOverride && versions.length > 0 && (
              <>
                <Divider />
                <MutedAction onClick={handleClear}>
                  <OptionHeader>
                    <RotateCcw size={11} />
                    <span>Use auto-detection</span>
                  </OptionHeader>
                  <OptionPath>
                    Clear the pinned interpreter override
                  </OptionPath>
                </MutedAction>
              </>
            )}
          </PopoverShell>,
          document.body,
        )}
    </>
  );
}
