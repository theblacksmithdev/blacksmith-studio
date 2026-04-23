import { Fragment } from "react";
import styled from "@emotion/styled";
import { Menu as ChakraMenu } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { PopupMenu } from "@/components/shared/ui";
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

export function ModelDropdown({
  models,
  value,
  onChange,
  placement = "up",
  compact = false,
}: ModelDropdownProps) {
  const groups = groupByFamily(models);
  const active = models.find((m) => m.id === value) ?? null;

  return (
    <PopupMenu
      placement={placement === "up" ? "top-start" : "bottom-start"}
      gutter={6}
      minWidth={220}
      maxHeight={380}
      padding={3}
      trigger={
        <Trigger data-compact={compact || undefined} type="button">
          <TriggerLabel>{active?.label ?? "Select model"}</TriggerLabel>
          <TriggerChevron>
            <ChevronDown size={11} strokeWidth={2} />
          </TriggerChevron>
        </Trigger>
      }
    >
      <ChakraMenu.RadioItemGroup
        value={value ?? ""}
        onValueChange={(d) => d.value && onChange(d.value)}
      >
        {groups.map((group, gi) => (
          <Fragment key={group.family}>
            <GroupLabel data-first={gi === 0 || undefined}>
              {group.family}
            </GroupLabel>
            {group.entries.map((m) => (
              <Row key={m.id} value={m.id}>
                <RadioIndicator>
                  <RadioDot />
                </RadioIndicator>
                <RowLabel>{m.label}</RowLabel>
                <RowWindow>{formatWindow(m.contextWindow)}</RowWindow>
              </Row>
            ))}
          </Fragment>
        ))}
      </ChakraMenu.RadioItemGroup>
    </PopupMenu>
  );
}

const Trigger = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 7px;
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

  &[data-state="open"] {
    background: var(--studio-bg-hover);
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:focus-visible {
    border-color: var(--studio-brand-border);
    box-shadow: var(--studio-ring-focus);
  }

  &[data-compact] {
    padding: 2px 8px;
    font-size: 11px;
    gap: 4px;
  }
`;

const TriggerLabel = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

const TriggerChevron = styled.span`
  display: inline-flex;
  color: var(--studio-text-muted);
  flex-shrink: 0;
  transition: transform 0.18s ease;

  [data-state="open"] & {
    transform: rotate(180deg);
  }
`;

const GroupLabel = styled(ChakraMenu.ItemGroupLabel)`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--studio-text-muted);
  padding: 8px 9px 3px;

  &[data-first] {
    padding-top: 4px;
  }
`;

const Row = styled(ChakraMenu.RadioItem)`
  all: unset;
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 5px 9px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--studio-text-secondary);
  transition:
    background 0.1s ease,
    color 0.1s ease;
  min-width: 0;

  &[data-highlighted],
  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }

  &[data-state="checked"] {
    color: var(--studio-text-primary);
  }
`;

const RadioIndicator = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--studio-border-hover);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s ease;

  [data-state="checked"] > & {
    border-color: var(--studio-brand);
  }
`;

const RadioDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: transparent;
  transform: scale(0.6);
  transition:
    background 0.12s ease,
    transform 0.12s ease;

  [data-state="checked"] & {
    background: var(--studio-brand);
    transform: scale(1);
  }
`;

const RowLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const RowWindow = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  font-variant-numeric: tabular-nums;
  font-family: "SF Mono", "Fira Code", Menlo, monospace;
  flex-shrink: 0;
`;
