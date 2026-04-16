import { type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { MessageSquare } from "lucide-react";
import { MessageBubble, type ConversationMessage } from "./message-bubble";
import { useAutoScroll } from "./hooks/use-auto-scroll";
import { EmptyState, spacing } from "@/components/shared/ui";

interface MessageListProps {
  messages: ConversationMessage[];
  maxWidth?: string;
  emptyState?: ReactNode;
  /** Rendered after all messages (e.g. streaming indicator) */
  trailing?: ReactNode;
  /** Custom renderer per message — return null to use default bubble */
  renderMessage?: (msg: ConversationMessage) => ReactNode | null;
  /** Custom content renderer inside the default bubble (e.g. MarkdownRenderer) */
  renderContent?: (content: string) => ReactNode;
}

export function MessageList({
  messages,
  maxWidth = "760px",
  emptyState,
  trailing,
  renderMessage,
  renderContent,
}: MessageListProps) {
  const bottomRef = useAutoScroll([messages, trailing]);

  if (messages.length === 0 && !trailing) {
    return (
      <Flex css={{ flex: 1 }}>
        {emptyState ?? (
          <EmptyState
            compact
            icon={<MessageSquare />}
            description="Send a message to start the conversation"
          />
        )}
      </Flex>
    );
  }

  return (
    <Box flex={1} overflowY="auto" minH={0} data-scroll-container>
      <Box
        css={{
          maxWidth,
          margin: "0 auto",
          padding: `${spacing["3xl"]} ${spacing.xl} ${spacing.md}`,
          display: "flex",
          flexDirection: "column",
          gap: spacing.xl,
        }}
      >
        {messages.map((msg, i) => {
          // Custom renderer takes full control
          if (renderMessage) {
            const custom = renderMessage(msg);
            if (custom !== null) return <Box key={msg.id}>{custom}</Box>;
          }

          // Default: separator between turns + standard bubble
          const prevMsg = messages[i - 1];
          const showSeparator =
            i > 0 && msg.role === "user" && prevMsg?.role !== "user";

          return (
            <Box key={msg.id}>
              {showSeparator && (
                <Box
                  css={{
                    height: "1px",
                    background: "var(--studio-border)",
                    margin: `${spacing.xs} 0 ${spacing.xl}`,
                    opacity: 0.5,
                  }}
                />
              )}
              <MessageBubble message={msg} renderContent={renderContent} />
            </Box>
          );
        })}
        {trailing}
        <Box ref={bottomRef} css={{ height: spacing.xs }} />
      </Box>
    </Box>
  );
}
