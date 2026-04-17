import type { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { Text, spacing, radii } from "@/components/shared/ui";

interface SystemPillProps {
  icon?: ReactNode;
  content: string;
  tone?: "neutral" | "error";
}

export function SystemPill({ icon, content, tone = "neutral" }: SystemPillProps) {
  const error = tone === "error";
  return (
    <Flex justify="center" css={{ width: "100%" }}>
      <Flex
        align="center"
        gap={spacing.xs}
        css={{
          padding: `4px ${spacing.md}`,
          borderRadius: radii.full,
          background: error
            ? "var(--studio-error-subtle)"
            : "var(--studio-bg-surface)",
          border: `1px solid ${
            error ? "var(--studio-error)" : "var(--studio-border)"
          }`,
          color: error
            ? "var(--studio-error)"
            : "var(--studio-text-secondary)",
          maxWidth: "80%",
        }}
      >
        {icon}
        <Text
          variant="tiny"
          css={{
            fontWeight: 500,
            color: "inherit",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {content}
        </Text>
      </Flex>
    </Flex>
  );
}
