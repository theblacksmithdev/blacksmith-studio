import { createPortal } from "react-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Text } from "../typography";
import { Button } from "../button";
import { spacing, radii, shadows } from "../tokens";

export type ConfirmDialogVariant = "danger" | "default";

interface ConfirmDialogProps {
  /** @deprecated Use message instead */
  title?: string;
  message: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  message,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  return createPortal(
    <Flex
      align="center"
      justify="center"
      onClick={onCancel}
      css={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "var(--studio-backdrop)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.12s ease",
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        css={{
          width: "380px",
          borderRadius: radii["3xl"],
          border: "1px solid var(--studio-border)",
          background: "var(--studio-bg-main)",
          boxShadow: shadows.lg,
          overflow: "hidden",
          "@keyframes dialogEnter": {
            from: { opacity: 0, transform: "scale(0.97)" },
            to: { opacity: 1, transform: "scale(1)" },
          },
          animation: "dialogEnter 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Box
          css={{ padding: `${spacing["2xl"]} ${spacing["2xl"]} ${spacing.lg}` }}
        >
          <Text variant="subtitle" css={{ marginBottom: spacing.xs }}>
            {message}
          </Text>
          {description && (
            <Text variant="body" color="muted" css={{ lineHeight: 1.55 }}>
              {description}
            </Text>
          )}
        </Box>

        <Flex
          gap={2}
          justify="flex-end"
          css={{ padding: `${spacing.md} ${spacing["2xl"]} ${spacing["2xl"]}` }}
        >
          <Button variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Flex>,
    document.body,
  );
}
