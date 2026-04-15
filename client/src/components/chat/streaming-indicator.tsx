import { useState, useEffect } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Text, Skeleton, spacing } from "@/components/shared/ui";
import { ToolCallCard } from "./tool-call-card";
import { ClaudeHeader } from "./claude-header";
import { useChatStore } from "@/stores/chat-store";

interface StreamingIndicatorProps {
  partialMessage: string | null;
}

export function StreamingIndicator({
  partialMessage,
}: StreamingIndicatorProps) {
  const [elapsed, setElapsed] = useState(0);
  const currentToolCalls = useChatStore((s) => s.currentToolCalls);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const timeLabel =
    elapsed < 60
      ? `${elapsed}s`
      : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <Box css={{ animation: "bubbleIn 0.2s ease" }}>
      <ClaudeHeader
        extra={
          <Text variant="caption" color="muted">
            {timeLabel}
          </Text>
        }
      />

      <Box css={{ paddingLeft: "30px", marginTop: spacing.sm }}>
        {/* Active tool calls */}
        {currentToolCalls.length > 0 && (
          <Flex
            direction="column"
            gap={spacing.xs}
            css={{ marginBottom: spacing.sm }}
          >
            {currentToolCalls.map((tc) => (
              <ToolCallCard key={tc.toolId} toolCall={tc} isActive />
            ))}
          </Flex>
        )}

        {/* Streaming text or thinking state */}
        {partialMessage ? (
          <Box css={{ position: "relative" }}>
            <MarkdownRenderer content={partialMessage} />
            <Box
              as="span"
              css={{
                display: "inline-block",
                width: "2px",
                height: "16px",
                background: "var(--studio-accent)",
                marginLeft: "2px",
                verticalAlign: "text-bottom",
                animation: "cursorBlink 1s step-end infinite",
              }}
            />
          </Box>
        ) : currentToolCalls.length === 0 ? (
          <Flex align="center" gap={spacing.sm}>
            <Skeleton variant="text" width="100px" height="3px" />
            <Text variant="caption" color="muted">
              Thinking...
            </Text>
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
}
