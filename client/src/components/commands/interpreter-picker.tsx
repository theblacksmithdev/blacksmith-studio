import { useMemo } from "react";
import styled from "@emotion/styled";
import { Check, ChevronDown, RotateCcw, Loader2 } from "lucide-react";
import { useInstalledVersionsQuery } from "@/api/hooks/commands";
import { Menu, type MenuOption } from "@/components/shared/ui";

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--studio-text-primary);
`;

const ItemVersion = styled.span`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 10px;
  color: var(--studio-text-muted);
  font-weight: 400;
`;

const ItemPath = styled.div`
  font-family: var(--studio-font-mono, "SF Mono", monospace);
  font-size: 10px;
  color: var(--studio-text-muted);
  word-break: break-all;
  line-height: 1.35;
`;

const Placeholder = styled.div`
  padding: 10px 12px;
  font-size: 12px;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export interface InterpreterPickerProps {
  toolchainId: string;
  /** Current interpreter path (when an env is resolved); renders a
   *  check-mark next to the matching entry. */
  currentPath?: string;
  /** When the active env is a user-pinned override, appends a
   *  "Use auto-detection" action at the bottom. */
  hasOverride?: boolean;
  /** Trigger label; defaults to "Change". */
  label?: string;
  onSelect: (path: string) => void;
  onClearOverride?: () => void;
}

/**
 * Version picker for an installed interpreter.
 *
 * Uses the shared `Menu` component so positioning, z-index, focus
 * management, and hover states come from the same primitive every
 * other menu in the app uses. Rich two-line items (version label +
 * source + mono path) are passed as `ReactNode` labels.
 */
export function InterpreterPicker({
  toolchainId,
  currentPath,
  hasOverride = false,
  label = "Change",
  onSelect,
  onClearOverride,
}: InterpreterPickerProps) {
  const { data: versions = [], isLoading } =
    useInstalledVersionsQuery(toolchainId);

  const options = useMemo<MenuOption[]>(() => {
    if (isLoading) {
      return [
        {
          value: "__loading",
          disabled: true,
          onClick: () => {},
          label: (
            <Placeholder>
              <Loader2
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Scanning for interpreters…
            </Placeholder>
          ),
        },
      ];
    }
    if (versions.length === 0) {
      return [
        {
          value: "__empty",
          disabled: true,
          onClick: () => {},
          label: (
            <Placeholder>
              No interpreters detected on this system.
            </Placeholder>
          ),
        },
      ];
    }

    const versionOptions: MenuOption[] = versions.map((v) => {
      const selected = currentPath === v.path;
      return {
        value: v.path,
        onClick: () => onSelect(v.path),
        label: (
          <ItemBody>
            <ItemTitle>
              {selected ? (
                <Check size={11} style={{ color: "var(--studio-accent)" }} />
              ) : (
                <span style={{ width: 11, display: "inline-block" }} />
              )}
              <span style={{ flex: 1 }}>{v.displayName}</span>
              <ItemVersion>{v.version}</ItemVersion>
            </ItemTitle>
            <ItemPath>{v.path}</ItemPath>
          </ItemBody>
        ),
      };
    });

    if (hasOverride && onClearOverride) {
      versionOptions.push({
        value: "__clear",
        separator: true,
        icon: <RotateCcw />,
        onClick: onClearOverride,
        label: "Use auto-detection",
      });
    }

    return versionOptions;
  }, [versions, isLoading, currentPath, hasOverride, onSelect, onClearOverride]);

  return (
    <Menu
      trigger={
        <Trigger type="button">
          {label}
          <ChevronDown size={11} />
        </Trigger>
      }
      options={options}
    />
  );
}
