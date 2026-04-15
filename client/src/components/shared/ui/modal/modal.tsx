import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Flex, Box } from "@chakra-ui/react";
import { X } from "lucide-react";
import { spacing, radii, shadows } from "../tokens";
import { Text } from "../typography";
import { Button } from "../button";
import { IconButton } from "../icon-button";

interface ModalProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
  footer?: ReactNode;
  /** Rendered before the title (e.g. back button) */
  headerExtra?: ReactNode;
  /** Close on Escape key (default: true) */
  closeOnEscape?: boolean;
  /** Close when clicking the backdrop (default: true) */
  closeOnBackdrop?: boolean;
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  width = "480px",
  footer,
  headerExtra,
  closeOnEscape = true,
  closeOnBackdrop = true,
}: ModalProps) {
  // Escape key
  useEffect(() => {
    if (!closeOnEscape) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeOnEscape, onClose]);
  return createPortal(
    <Flex
      align="center"
      justify="center"
      onClick={closeOnBackdrop ? onClose : undefined}
      css={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "var(--studio-backdrop)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <Flex
        direction="column"
        onClick={(e) => e.stopPropagation()}
        css={{
          width,
          maxHeight: "85vh",
          background: "var(--studio-bg-main)",
          borderRadius: radii["3xl"],
          border: "1px solid var(--studio-border)",
          boxShadow: shadows.lg,
          overflow: "hidden",
          "@keyframes modalEnter": {
            from: { opacity: 0, transform: "scale(0.97) translateY(4px)" },
            to: { opacity: 1, transform: "scale(1) translateY(0)" },
          },
          animation: "modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <Flex
          align="center"
          gap={3}
          css={{
            padding: `${spacing.lg} ${spacing.xl}`,
            borderBottom: "1px solid var(--studio-border)",
            flexShrink: 0,
          }}
        >
          {headerExtra}
          <Box css={{ flex: 1 }}>
            <Text variant="subtitle">{title}</Text>
            {subtitle && (
              <Text variant="caption" color="muted">
                {subtitle}
              </Text>
            )}
          </Box>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </IconButton>
        </Flex>

        {/* Body */}
        <Box css={{ flex: 1, overflowY: "auto", padding: spacing.xl }}>
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Flex
            align="center"
            gap={2}
            css={{
              padding: `${spacing.md} ${spacing.xl}`,
              borderTop: "1px solid var(--studio-border)",
              flexShrink: 0,
            }}
          >
            {footer}
          </Flex>
        )}
      </Flex>
    </Flex>,
    document.body,
  );
}

/* Re-export Button variants as modal-specific helpers for convenience */
export function ModalPrimaryButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="primary" size="md" {...props}>
      {children}
    </Button>
  );
}

export function ModalSecondaryButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="secondary" size="md" {...props}>
      {children}
    </Button>
  );
}

export function ModalDangerButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="danger" size="md" {...props}>
      {children}
    </Button>
  );
}

export function ModalFooterSpacer() {
  return <Flex flex={1} />;
}
