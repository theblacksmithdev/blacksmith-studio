import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { spacing, radii, shadows } from "../tokens";

export type TextareaSize = "sm" | "md";

const sizeStyles: Record<TextareaSize, SystemStyleObject> = {
  sm: {
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: "12px",
    borderRadius: radii.md,
    minHeight: "60px",
  },
  md: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: "13px",
    borderRadius: radii.md,
    minHeight: "80px",
  },
};

interface TextareaProps extends Omit<ChakraTextareaProps, "size"> {
  size?: TextareaSize;
}

export function Textarea({
  size = "md",
  css: cssProp,
  ...rest
}: TextareaProps) {
  const merged: SystemStyleObject = {
    background: "var(--studio-bg-inset)",
    border: "1px solid var(--studio-border)",
    color: "var(--studio-text-primary)",
    fontFamily: "inherit",
    letterSpacing: "inherit",
    lineHeight: 1.5,
    outline: "none",
    resize: "vertical",
    transition: "all 0.12s ease",
    "&::placeholder": { color: "var(--studio-text-muted)" },
    "&:focus": {
      borderColor: "var(--studio-brand-border)",
      boxShadow: shadows.focus,
      outline: "none",
    },
    "&:disabled": { opacity: 0.5, cursor: "default", resize: "none" },
    ...sizeStyles[size],
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return <ChakraTextarea css={merged} {...rest} />;
}
