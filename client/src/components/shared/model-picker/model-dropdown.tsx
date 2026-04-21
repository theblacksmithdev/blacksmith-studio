import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import { ChevronDown } from "lucide-react";
import type { ModelEntry } from "@/api/modules/ai";
import { formatWindow, groupByFamily } from "./helpers";

interface ModelDropdownProps {
  models: ModelEntry[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  /** Which direction the panel opens. Composer is usually "up". */
  placement?: "up" | "down";
  /** When true, renders a minimal trigger — used inside tight spaces. */
  compact?: boolean;
}

/**
 * Dropdown variant — used in the chat composer and the agents team
 * panel. Portal-positioned glass panel so it escapes overflow
 * containers. Rows are slim with a left-edge accent on the selected
 * item and a right-aligned mono context-window chip.
 */
export function ModelDropdown({
  models,
  value,
  onChange,
  placement = "up",
  compact = false,
}: ModelDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panelRect, setPanelRect] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
  } | null>(null);

  const active = models.find((m) => m.id === value) ?? null;

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = 260;
    const left = Math.min(r.left, window.innerWidth - width - 12);
    if (placement === "up") {
      setPanelRect({ left, bottom: window.innerHeight - r.top + 8, width });
    } else {
      setPanelRect({ left, top: r.bottom + 8, width });
    }
  }, [open, placement]);

  const groups = groupByFamily(models);

  return (
    <>
      <Trigger
        ref={triggerRef}
        data-compact={compact || undefined}
        data-open={open || undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <TriggerLabel>{active?.label ?? "Select model"}</TriggerLabel>
        {active && !compact && (
          <TriggerMeta>{formatWindow(active.contextWindow)}</TriggerMeta>
        )}
        <TriggerChevron data-open={open || undefined}>
          <ChevronDown size={11} strokeWidth={2} />
        </TriggerChevron>
      </Trigger>

      {open && panelRect &&
        createPortal(
          <>
            <Scrim onClick={() => setOpen(false)} />
            <Panel
              style={{
                left: panelRect.left,
                top: panelRect.top,
                bottom: panelRect.bottom,
                width: panelRect.width,
              }}
            >
              {groups.map((group, gi) => (
                <Group key={group.family} data-first={gi === 0 || undefined}>
                  <GroupLabel>{group.family}</GroupLabel>
                  <Rows>
                    {group.entries.map((m) => {
                      const selected = m.id === value;
                      return (
                        <Row
                          key={m.id}
                          data-active={selected || undefined}
                          onClick={() => {
                            onChange(m.id);
                            setOpen(false);
                          }}
                        >
                          <RowMark data-active={selected || undefined} />
                          <RowMain>
                            <RowLabel>{m.label}</RowLabel>
                            {m.version && (
                              <RowVersion>v{m.version}</RowVersion>
                            )}
                          </RowMain>
                          <RowWindow>{formatWindow(m.contextWindow)}</RowWindow>
                        </Row>
                      );
                    })}
                  </Rows>
                </Group>
              ))}
            </Panel>
          </>,
          document.body,
        )}
    </>
  );
}

const Trigger = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--studio-text-secondary);
  cursor: pointer;
  transition:
    background 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;

  &:hover {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border);
    color: var(--studio-text-primary);
  }

  &[data-open] {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &[data-compact] {
    padding: 3px 8px;
    font-size: 11px;
    gap: 6px;
  }
`;

const TriggerLabel = styled.span``;

const TriggerMeta = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--studio-bg-surface);
`;

const TriggerChevron = styled.span`
  display: inline-flex;
  color: var(--studio-text-muted);
  transition: transform 0.18s ease;

  &[data-open] {
    transform: rotate(180deg);
  }
`;

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99;
`;

const Panel = styled.div`
  position: fixed;
  z-index: 100;
  padding: 4px;
  background: color-mix(in srgb, var(--studio-bg-surface) 92%, transparent);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border: 1px solid var(--studio-border-hover);
  border-radius: 12px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 14px 40px rgba(0, 0, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
  animation: fadeIn 0.12s ease;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px 4px 4px;
  border-top: 1px solid var(--studio-border);

  &[data-first] {
    border-top: none;
  }
`;

const GroupLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  padding: 2px 10px 6px;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const Row = styled.button`
  all: unset;
  position: relative;
  display: grid;
  grid-template-columns: 3px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 10px 7px 8px;
  border-radius: 7px;
  cursor: pointer;
  color: var(--studio-text-secondary);
  transition:
    background 0.1s ease,
    color 0.1s ease;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &[data-active] {
    color: var(--studio-text-primary);
  }
`;

const RowMark = styled.span`
  width: 3px;
  height: 18px;
  border-radius: 2px;
  background: transparent;
  transition: background 0.12s ease;

  &[data-active] {
    background: var(--studio-text-primary);
  }
`;

const RowMain = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
`;

const RowLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowVersion = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  font-variant-numeric: tabular-nums;
`;

const RowWindow = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
`;
