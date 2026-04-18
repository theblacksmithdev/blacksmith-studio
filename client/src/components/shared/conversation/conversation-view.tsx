import { type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { MessageList } from "./message-list";
import { ChatComposer } from "./chat-composer";
import { spacing } from "@/components/shared/ui";
import type { ConversationMessage } from "./message-bubble";
import type { AttachmentRecord } from "./attachments";

interface ConversationViewProps {
  messages: ConversationMessage[];
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  maxWidth?: string;
  streamingTrailing?: ReactNode;
  emptyState?: ReactNode;
  renderMessage?: (msg: ConversationMessage) => ReactNode | null;
  renderContent?: (content: string) => ReactNode;
  projectId?: string;
  conversationId?: string;
  enableAttachments?: boolean;
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
  projectId,
  conversationId,
  enableAttachments,
}: ConversationViewProps) {
  return (
    <Flex
      direction="column"
      css={{
        height: "100%",
        width: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
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
        <ChatComposer
          variant="compact"
          onSend={onSend}
          onCancel={onCancel}
          isStreaming={isStreaming}
          disabled={disabled}
          placeholder={placeholder}
          initialValue={initialValue}
          projectId={projectId}
          conversationId={conversationId}
          enableAttachments={enableAttachments}
        />
      </Box>
    </Flex>
  );
}
