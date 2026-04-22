import { Box, type BoxProps } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { spacing, radii } from "../tokens";

/**
 * Visual variants for chips and status badges.
 *
 * - `live` — something is currently happening (brand green, pairs with
 *   `dot` + `pulse` for streaming / running states).
 * - `success` — a past-tense acknowledgement (kept green for continuity
 *   with existing call sites; if you need "live vs done" distinction,
 *   use `live` for running and `success` / `muted` for completed).
 * - `muted` — neutral secondary chip with low contrast, for
 *   "legacy/optional/aside" signalling without competing with primary
 *   content.
 */
export type BadgeVariant =
  | "default"
  | "live"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "muted"
  | "outline";
export type BadgeSize = "sm" | "md";

const sizeStyles: Record<BadgeSize, SystemStyleObject> = {
  sm: {
    padding: `${spacing["2xs"]} ${spacing.xs}`,
    fontSize: "10px",
    borderRadius: radii.xs,
  },
  md: {
    padding: `${spacing["2xs"]} ${spacing.sm}`,
    fontSize: "11px",
    borderRadius: radii.sm,
  },
};

const variantStyles: Record<BadgeVariant, SystemStyleObject> = {
  default: {
    background: "var(--studio-bg-surface)",
    color: "var(--studio-text-secondary)",
    border: "1px solid var(--studio-border)",
  },
  live: {
    background: "var(--studio-brand-subtle)",
    color: "var(--studio-brand)",
    border: "1px solid var(--studio-brand-border)",
  },
  success: {
    background: "var(--studio-green-subtle)",
    color: "var(--studio-green)",
    border: "1px solid var(--studio-green-border)",
  },
  error: {
    background: "var(--studio-error-subtle)",
    color: "var(--studio-error)",
    border: "1px solid transparent",
  },
  warning: {
    background: "rgba(245,124,0,0.08)",
    color: "var(--studio-warning)",
    border: "1px solid transparent",
  },
  info: {
    background: "var(--studio-blue-subtle)",
    color: "var(--studio-link)",
    border: "1px solid transparent",
  },
  muted: {
    background: "var(--studio-bg-main)",
    color: "var(--studio-text-muted)",
    border: "1px solid var(--studio-border)",
  },
  outline: {
    background: "transparent",
    color: "var(--studio-text-tertiary)",
    border: "1px solid var(--studio-border)",
  },
};

interface BadgeProps extends Omit<BoxProps, "variant"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Render a small colored leading dot matching the variant. */
  dot?: boolean;
  /** Softly pulse the dot — pair with `live`. Ignored without `dot`. */
  pulse?: boolean;
}

const dotColorByVariant: Record<BadgeVariant, string> = {
  default: "var(--studio-text-muted)",
  live: "var(--studio-brand)",
  success: "var(--studio-green)",
  error: "var(--studio-error)",
  warning: "var(--studio-warning)",
  info: "var(--studio-link)",
  muted: "var(--studio-text-muted)",
  outline: "var(--studio-text-muted)",
};

export function Badge({
  variant = "default",
  size = "sm",
  dot,
  pulse,
  css: cssProp,
  children,
  ...rest
}: BadgeProps) {
  const merged: SystemStyleObject = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
    lineHeight: 1.4,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return (
    <Box as="span" css={merged} {...rest}>
      {dot && (
        <Box
          as="span"
          css={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: dotColorByVariant[variant],
            flexShrink: 0,
            animation: pulse ? "badgePulse 1.4s ease-in-out infinite" : "none",
            "@keyframes badgePulse": {
              "0%,100%": { opacity: 1 },
              "50%": { opacity: 0.35 },
            },
          }}
        />
      )}
      {children}
    </Box>
  );
}
