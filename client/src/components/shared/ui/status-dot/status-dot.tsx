import { Box, type BoxProps } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";

export type DotStatus = "idle" | "active" | "done" | "error";
export type DotSize = "xs" | "sm" | "md";

const sizeMap: Record<DotSize, string> = {
  xs: "4px",
  sm: "6px",
  md: "8px",
};

const statusColors: Record<DotStatus, string> = {
  idle: "transparent",
  active: "var(--studio-green)",
  done: "var(--studio-accent)",
  error: "var(--studio-error)",
};

interface StatusDotProps extends Omit<BoxProps, "status"> {
  status?: DotStatus;
  size?: DotSize;
  /** Show glow/pulse animation when active */
  animated?: boolean;
}

export function StatusDot({
  status = "idle",
  size = "sm",
  animated = true,
  css: cssProp,
  ...rest
}: StatusDotProps) {
  const dim = sizeMap[size];
  const isActive = status === "active";

  const styles: SystemStyleObject = {
    width: dim,
    height: dim,
    borderRadius: "50%",
    flexShrink: 0,
    background: statusColors[status],
    transition: "all 0.2s ease",
    ...(isActive && animated
      ? {
          boxShadow: `0 0 ${size === "xs" ? "3px" : "5px"} var(--studio-green-border)`,
          animation: "pulse 1.5s ease-in-out infinite",
        }
      : {}),
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return <Box as="span" css={styles} {...rest} />;
}
