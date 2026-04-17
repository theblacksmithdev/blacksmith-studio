import { Box } from "@chakra-ui/react";
import type { ToolStatus } from "./types";

const STATUS_COLOR: Record<ToolStatus, string> = {
  pending: "var(--studio-text-muted)",
  running: "var(--studio-text-primary)",
  done: "var(--studio-green)",
  error: "var(--studio-error)",
};

export function ToolStatusDot({ status }: { status: ToolStatus }) {
  const color = STATUS_COLOR[status];
  const pulsing = status === "running";
  return (
    <Box
      aria-label={status}
      css={{
        width: "6px",
        height: "6px",
        borderRadius: "999px",
        flexShrink: 0,
        background: color,
        boxShadow: pulsing ? `0 0 0 3px ${color}22` : "none",
        animation: pulsing
          ? "studio-tool-pulse 1.4s ease-in-out infinite"
          : "none",
        "@keyframes studio-tool-pulse": {
          "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.15)" },
        },
      }}
    />
  );
}
