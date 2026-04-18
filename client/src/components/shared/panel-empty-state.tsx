import type { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { Text } from "./ui";

interface PanelEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * Compact centred empty state used in side-panel tabs (Artifacts,
 * Changes, and peers). Intentionally smaller than the global
 * `EmptyState` — side panels have limited vertical room.
 */
export function PanelEmptyState({
  icon,
  title,
  description,
}: PanelEmptyStateProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="14px"
      css={{
        flex: 1,
        width: "100%",
        height: "100%",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <Flex
        css={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "var(--studio-bg-surface)",
          border: "1px solid var(--studio-border)",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--studio-text-muted)",
        }}
      >
        {icon}
      </Flex>
      <Flex direction="column" gap="4px" align="center">
        <Text
          css={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
          }}
        >
          {title}
        </Text>
        <Text
          css={{
            fontSize: "13px",
            color: "var(--studio-text-tertiary)",
            maxWidth: "300px",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Text>
      </Flex>
    </Flex>
  );
}
