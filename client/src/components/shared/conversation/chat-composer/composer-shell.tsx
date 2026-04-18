import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { radii, shadows } from "@/components/shared/ui";

interface ComposerShellProps {
  over: boolean;
  dragHandlers?: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  children: ReactNode;
}

/**
 * The chrome of the composer: background, border (with focus-within +
 * drag-over states), shadow, and the dashed drop-zone overlay. Owns the
 * drag-and-drop listeners so inner content doesn't have to think about
 * them.
 */
export function ComposerShell({
  over,
  dragHandlers,
  children,
}: ComposerShellProps) {
  return (
    <Box
      {...(dragHandlers ?? {})}
      css={{
        width: "100%",
        position: "relative",
        background: "var(--studio-bg-surface)",
        borderRadius: radii["2xl"],
        border: `1px solid ${
          over ? "var(--studio-border-hover)" : "var(--studio-border)"
        }`,
        transition: "all 0.2s ease",
        boxShadow: shadows.sm,
        "&:focus-within": {
          borderColor: "var(--studio-border-hover)",
          boxShadow: shadows.lg,
        },
      }}
    >
      {over && (
        <Box
          css={{
            position: "absolute",
            inset: 0,
            borderRadius: radii["2xl"],
            border: "1.5px dashed var(--studio-border-hover)",
            background: "var(--studio-bg-hover)",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
      {children}
    </Box>
  );
}
