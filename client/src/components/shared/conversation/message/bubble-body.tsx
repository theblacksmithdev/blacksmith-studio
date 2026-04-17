import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import { Text } from "@/components/shared/ui";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface BubbleBodyProps {
  content: string;
  renderContent?: (content: string) => ReactNode;
  tone?: "default" | "onAccent" | "muted";
  markdown?: boolean;
}

export function BubbleBody({
  content,
  renderContent,
  tone = "default",
  markdown = true,
}: BubbleBodyProps) {
  if (renderContent) return <Box>{renderContent(content)}</Box>;

  if (markdown && tone !== "onAccent") {
    return <MarkdownRenderer content={content} />;
  }

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
