import type { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { X } from "lucide-react";
import { Text } from "../typography";
import { spacing, radii } from "../tokens";

export type AlertVariant = "error" | "warning" | "info" | "success";

const variantStyles: Record<
  AlertVariant,
  { bg: string; border: string; color: string }
> = {
  error: {
    bg: "var(--studio-error-subtle)",
    border: "var(--studio-error)",
    color: "var(--studio-error)",
  },
  warning: {
    bg: "var(--studio-warning-subtle, rgba(234, 179, 8, 0.08))",
    border: "var(--studio-warning)",
    color: "var(--studio-warning)",
  },
  info: {
    bg: "var(--studio-blue-subtle, rgba(59, 130, 246, 0.08))",
    border: "var(--studio-text-muted)",
    color: "var(--studio-text-secondary)",
  },
  success: {
    bg: "var(--studio-green-subtle, rgba(34, 197, 94, 0.08))",
    border: "var(--studio-green)",
    color: "var(--studio-green)",
  },
};

interface AlertProps {
  variant?: AlertVariant;
  icon?: ReactNode;
  children: ReactNode;
  onDismiss?: () => void;
}

export function Alert({
  variant = "info",
  icon,
  children,
  onDismiss,
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <Flex
      gap={spacing.sm}
      css={{
        position: "relative",
        padding: `${spacing.sm} ${spacing.md}`,
        paddingRight: onDismiss ? spacing["3xl"] : spacing.md,
        borderRadius: radii.md,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      {icon && (
        <Box css={{ flexShrink: 0, color: styles.color, marginTop: "1px" }}>
          {icon}
        </Box>
      )}
      <Text variant="bodySmall" css={{ color: styles.color, flex: 1 }}>
        {children}
      </Text>
      {onDismiss && (
        <Box
          as="button"
          onClick={onDismiss}
          css={{
            position: "absolute",
            top: spacing.sm,
            right: spacing.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            border: "none",
            borderRadius: radii.xs,
            background: "transparent",
            color: styles.color,
            cursor: "pointer",
            flexShrink: 0,
            opacity: 0.5,
            transition: "opacity 0.1s ease",
            "&:hover": { opacity: 1 },
          }}
        >
          <X size={12} />
        </Box>
      )}
    </Flex>
  );
}
