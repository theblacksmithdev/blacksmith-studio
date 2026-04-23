import { type ReactNode } from "react";
import styled from "@emotion/styled";
import {
  PopupMenu,
  PopupMenuItem,
  PopupMenuSeparator,
  type PopupMenuPlacement,
} from "../popup-menu";

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
  placement?: PopupMenuPlacement;
}

export function Menu({ trigger, options, placement = "bottom-end" }: MenuProps) {
  return (
    <PopupMenu
      trigger={trigger}
      placement={placement}
      minWidth={180}
      padding={4}
    >
      {options.map((opt, i) => (
        <span key={i}>
          {opt.separator && <PopupMenuSeparator />}
          <Item
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
          </Item>
        </span>
      ))}
    </PopupMenu>
  );
}

/** Extends `PopupMenuItem` with a `data-danger` variant for destructive actions. */
const Item = styled(PopupMenuItem)<{ "data-danger"?: boolean }>`
  padding: 7px 10px;
  border-radius: 6px;
  color: ${(p) =>
    p["data-danger"]
      ? "var(--studio-error)"
      : "var(--studio-text-secondary)"};
  font-size: 13px;

  &:hover,
  &[data-highlighted] {
    background: ${(p) =>
      p["data-danger"]
        ? "var(--studio-error-subtle)"
        : "var(--studio-bg-hover)"};
    color: ${(p) =>
      p["data-danger"]
        ? "var(--studio-error)"
        : "var(--studio-text-primary)"};
  }

  & svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;
