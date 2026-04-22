import {
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
} from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { sizes, radii, shadows } from "../tokens";
import { Tooltip } from "../tooltip";

export type IconButtonVariant = "default" | "ghost" | "danger";
export type IconButtonSize = "xs" | "sm" | "md";

const sizeStyles: Record<IconButtonSize, SystemStyleObject> = {
  xs: {
    width: sizes.icon.xs,
    minWidth: sizes.icon.xs,
    height: sizes.icon.xs,
    minHeight: sizes.icon.xs,
    borderRadius: radii.xs,
    "& svg": { width: "12px", height: "12px" },
  },
  sm: {
    width: sizes.icon.sm,
    minWidth: sizes.icon.sm,
    height: sizes.icon.sm,
    minHeight: sizes.icon.sm,
    borderRadius: radii.sm,
    "& svg": { width: "14px", height: "14px" },
  },
  md: {
    width: sizes.icon.md,
    minWidth: sizes.icon.md,
    height: sizes.icon.md,
    minHeight: sizes.icon.md,
    borderRadius: radii.md,
    "& svg": { width: "16px", height: "16px" },
  },
};

const variantStyles: Record<IconButtonVariant, SystemStyleObject> = {
  default: {
    background: "transparent",
    color: "var(--studio-text-muted)",
    border: "1px solid var(--studio-border)",
    "&:hover": {
      background: "var(--studio-bg-hover)",
      borderColor: "var(--studio-border-hover)",
      color: "var(--studio-text-primary)",
    },
    "&:active": { background: "var(--studio-bg-hover-strong)" },
  },
  ghost: {
    background: "transparent",
    color: "var(--studio-text-muted)",
    border: "none",
    "&:hover": {
      background: "var(--studio-bg-hover)",
      color: "var(--studio-text-primary)",
    },
    "&:active": { background: "var(--studio-bg-hover-strong)" },
  },
  danger: {
    background: "transparent",
    color: "var(--studio-text-muted)",
    border: "none",
    "&:hover": {
      background: "var(--studio-error-subtle)",
      color: "var(--studio-error)",
    },
  },
};

interface IconButtonProps extends Omit<
  ChakraIconButtonProps,
  "variant" | "size"
> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** If provided, wraps the button in a Tooltip */
  tooltip?: string;
}

export function IconButton({
  variant = "ghost",
  size = "sm",
  tooltip,
  css: cssProp,
  ...rest
}: IconButtonProps) {
  const merged: SystemStyleObject = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
    transition: "all 0.12s ease",
    flexShrink: 0,
    fontFamily: "inherit",
    outline: "none",
    // Keyboard-only brand ring. Mouse clicks stay quiet — :focus-visible
    // only matches when the focus arrived via keyboard / programmatic.
    "&:focus-visible": {
      boxShadow: shadows.focus,
    },
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  const button = <ChakraIconButton css={merged} {...rest} />;

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}
