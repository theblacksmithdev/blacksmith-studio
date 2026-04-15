import { Separator, type SeparatorProps } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";

export type DividerVariant = "full" | "fade" | "short";

const variantStyles: Record<DividerVariant, SystemStyleObject> = {
  full: {
    width: "100%",
    height: "1px",
    background: "var(--studio-border)",
    border: "none",
  },
  fade: {
    width: "100%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, var(--studio-border) 25%, var(--studio-border) 75%, transparent)",
    border: "none",
  },
  short: {
    width: "40px",
    height: "1px",
    background: "var(--studio-border)",
    border: "none",
    margin: "0 auto",
  },
};

interface DividerProps extends Omit<SeparatorProps, "variant"> {
  variant?: DividerVariant;
  /** Vertical spacing above and below */
  spacing?: string;
}

export function Divider({
  variant = "full",
  spacing,
  css: cssProp,
  ...rest
}: DividerProps) {
  const merged: SystemStyleObject = {
    flexShrink: variant === "full" ? 1 : 0,
    minWidth: 0,
    ...variantStyles[variant],
    ...(spacing ? { marginTop: spacing, marginBottom: spacing } : {}),
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return <Separator css={merged} {...rest} />;
}
