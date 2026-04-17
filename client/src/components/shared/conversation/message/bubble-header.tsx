import type { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Text, spacing } from "@/components/shared/ui";

interface BubbleHeaderProps {
  icon?: ReactNode;
  name?: string;
  time?: string | null;
  accent?: string;
  trailing?: ReactNode;
}

export function BubbleHeader({
  icon,
  name,
  time,
  accent,
  trailing,
}: BubbleHeaderProps) {
  if (!icon && !name && !time && !trailing) return null;

  return (
    <Flex align="center" gap={spacing.sm}>
      {icon && (
        <Box
          css={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            borderRadius: "999px",
            background: accent ?? "var(--studio-bg-surface)",
            color: accent
              ? "var(--studio-accent-fg)"
              : "var(--studio-text-secondary)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      {name && (
        <Text
          variant="label"
          css={{
            fontWeight: 600,
            color: "var(--studio-text-secondary)",
          }}
        >
          {name}
        </Text>
      )}
      {time && (
        <Text variant="tiny" color="muted">
          {time}
        </Text>
      )}
      {trailing}
    </Flex>
  );
}
