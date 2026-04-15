import { Box, type BoxProps } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { spacing, radii, shadows } from "../tokens";

export type CardVariant = "default" | "interactive" | "inset" | "glass";

const variantStyles: Record<CardVariant, SystemStyleObject> = {
  default: {
    background: "var(--studio-bg-surface)",
    border: "1px solid var(--studio-border)",
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  interactive: {
    background: "var(--studio-bg-main)",
    border: "1px solid var(--studio-border)",
    borderRadius: radii.xl,
    padding: spacing.lg,
    cursor: "pointer",
    transition: "all 0.12s ease",
    "&:hover": {
      borderColor: "var(--studio-border-hover)",
      background: "var(--studio-bg-surface)",
      boxShadow: shadows.sm,
    },
    "&:active": { transform: "scale(0.995)" },
  },
  inset: {
    background: "var(--studio-bg-inset)",
    border: "1px solid var(--studio-border)",
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  glass: {
    background: "var(--studio-glass)",
    backdropFilter: "blur(20px)",
    border: "1px solid var(--studio-glass-border)",
    borderRadius: radii["2xl"],
    padding: spacing.lg,
    boxShadow: shadows.lg,
  },
};

interface CardProps extends Omit<BoxProps, "variant"> {
  variant?: CardVariant;
  /** Override padding */
  p?: string;
}

export function Card({
  variant = "default",
  p,
  css: cssProp,
  children,
  ...rest
}: CardProps) {
  const merged: SystemStyleObject = {
    ...variantStyles[variant],
    ...(p !== undefined ? { padding: p } : {}),
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return (
    <Box css={merged} {...rest}>
      {children}
    </Box>
  );
}
