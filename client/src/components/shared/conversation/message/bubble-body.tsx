import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { Text } from "@/components/shared/ui";

interface BubbleBodyProps {
  content: string;
  renderContent?: (content: string) => ReactNode;
  tone?: "default" | "onAccent" | "muted";
}

export function BubbleBody({
  content,
  renderContent,
  tone = "default",
}: BubbleBodyProps) {
  if (renderContent) return <Box>{renderContent(content)}</Box>;

  const color =
    tone === "onAccent"
      ? "inherit"
      : tone === "muted"
        ? "var(--studio-text-secondary)"
        : "var(--studio-text-primary)";

  return (
    <Text
      variant="body"
      css={{
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        color,
      }}
    >
      {content}
    </Text>
  );
}
