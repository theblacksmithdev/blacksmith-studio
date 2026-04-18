import { type ReactNode } from "react";
import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import styled from "@emotion/styled";

/* ── Types ── */

export interface MenuOption {
  icon?: ReactNode;
  /** Primary label — string for normal items, `ReactNode` for rich
   *  multi-line content (e.g. label + secondary path line). The
   *  accessible item value defaults to the rendered label when a
   *  string is passed; pass `value` explicitly for non-string labels. */
  label: ReactNode;
  value?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** Insert a separator before this item */
  separator?: boolean;
}

export interface MenuProps {
  trigger: ReactNode;
  options: MenuOption[];
  /** Placement relative to trigger (default: 'bottom-end') */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

/* ── Styled overrides ── */

const StyledContent = styled(ChakraMenu.Content)`
  min-width: 180px;
  padding: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 1000;
  animation: menuFadeIn 0.1s ease;
  outline: none;

  @keyframes menuFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const StyledItem = styled(ChakraMenu.Item)<{ "data-danger"?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: ${(p) =>
    p["data-danger"] ? "var(--studio-error)" : "var(--studio-text-secondary)"};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;
  outline: none;

  &:hover,
  &[data-highlighted] {
    background: ${(p) =>
      p["data-danger"]
        ? "var(--studio-error-subtle)"
        : "var(--studio-bg-hover)"};
    color: ${(p) =>
      p["data-danger"] ? "var(--studio-error)" : "var(--studio-text-primary)"};
  }

  &[data-disabled] {
    opacity: 0.4;
    cursor: default;
  }

  & svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

const StyledSeparator = styled(ChakraMenu.Separator)`
  height: 1px;
  background: var(--studio-border);
  margin: 4px 6px;
  border: none;
`;

/* ── Component ── */

export function Menu({
  trigger,
  options,
  placement = "bottom-end",
}: MenuProps) {
  return (
    <ChakraMenu.Root positioning={{ placement }} lazyMount unmountOnExit>
      <ChakraMenu.Trigger asChild>{trigger}</ChakraMenu.Trigger>
      <Portal>
        <ChakraMenu.Positioner>
          <StyledContent>
            {options.map((opt, i) => (
              <span key={i}>
                {opt.separator && <StyledSeparator />}
                <StyledItem
                  value={
                    opt.value ??
                    (typeof opt.label === "string" ? opt.label : String(i))
                  }
                  data-danger={opt.danger || undefined}
                  disabled={opt.disabled}
                  onClick={opt.onClick}
                >
                  {opt.icon}
                  {opt.label}
                </StyledItem>
              </span>
            ))}
          </StyledContent>
        </ChakraMenu.Positioner>
      </Portal>
    </ChakraMenu.Root>
  );
}
