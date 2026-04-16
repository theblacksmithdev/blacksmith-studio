import { type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { MessageList } from "./message-list";
import { ConversationInput } from "./conversation-input";
import { spacing } from "@/components/shared/ui";
import type { ConversationMessage } from "./message-bubble";

interface ConversationViewProps {
  messages: ConversationMessage[];
  onSend: (text: string) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  maxWidth?: string;
  /** Rendered after all messages (e.g. streaming indicator) */
  streamingTrailing?: ReactNode;
  /** Custom empty state when no messages */
  emptyState?: ReactNode;
  /** Custom renderer per message — return null to use default bubble */
  renderMessage?: (msg: ConversationMessage) => ReactNode | null;
  /** Custom content renderer inside the default bubble (e.g. MarkdownRenderer) */
  renderContent?: (content: string) => ReactNode;
}

export function ConversationView({
  messages,
  onSend,
  onCancel,
  isStreaming,
  disabled,
  placeholder,
  initialValue,
  maxWidth = "760px",
  streamingTrailing,
  emptyState,
  renderMessage,
  renderContent,
}: ConversationViewProps) {
  return (
    <Flex direction="column" css={{ height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <MessageList
        messages={messages}
        maxWidth={maxWidth}
        emptyState={emptyState}
        trailing={streamingTrailing}
        renderMessage={renderMessage}
        renderContent={renderContent}
      />

      <Box
        css={{
          flexShrink: 0,
          padding: `0 ${spacing.xl} ${spacing.lg}`,
          maxWidth,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <ConversationInput
          onSend={onSend}
          onCancel={onCancel}
          isStreaming={isStreaming}
          disabled={disabled}
          placeholder={placeholder}
          initialValue={initialValue}
        />
      </Box>
    </Flex>
  );
}
