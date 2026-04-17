import type { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { bubbleKeyframes } from "./tokens";

interface ThinkingBubbleProps {
  icon?: ReactNode;
  name?: string;
  label?: string;
}

export function ThinkingBubble({
  icon,
  name,
  label = "Thinking...",
}: ThinkingBubbleProps) {
  return (
    <Flex direction="column" gap={spacing.xs}>
      <style>{bubbleKeyframes.css}</style>
      {(icon || name) && (
        <Flex align="center" gap={spacing.sm}>
          {icon}
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
        </Flex>
      )}
      <Flex
        align="center"
        gap={spacing.sm}
        css={{
          padding: `${spacing.sm} ${spacing.md}`,
          borderRadius: radii["2xl"],
          background: "var(--studio-bg-surface)",
          border: "1px solid var(--studio-border)",
          width: "fit-content",
        }}
      >
        <Flex gap="4px">
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              css={{
                width: "5px",
                height: "5px",
                borderRadius: "999px",
                background: "var(--studio-text-muted)",
                animation: `studio-thinking-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </Flex>
        <Text variant="tiny" color="muted" css={{ fontWeight: 500 }}>
          {label}
        </Text>
      </Flex>
    </Flex>
  );
}
