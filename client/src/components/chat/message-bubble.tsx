import { memo } from "react";
import { Flex } from "@chakra-ui/react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import {
  MessageBubble as SharedMessageBubble,
  type ConversationMessage,
} from "@/components/shared/conversation";
import { spacing } from "@/components/shared/ui";
import { ClaudeAvatar } from "./claude-header";
import { ToolCallCard } from "./tool-call-card";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const hasTools = !!message.toolCalls && message.toolCalls.length > 0;

  const adapted: ConversationMessage = {
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    senderName: message.role === "assistant" ? "Claude" : undefined,
    senderIcon:
      message.role === "assistant" ? <ClaudeAvatar size={22} /> : undefined,
    footer: hasTools ? (
      <Flex direction="column" gap={spacing.xs} css={{ marginTop: spacing.sm }}>
        {message.toolCalls!.map((tc) => (
          <ToolCallCard key={tc.toolId} toolCall={tc} />
        ))}
      </Flex>
    ) : undefined,
  };

  return (
    <SharedMessageBubble
      message={adapted}
      renderContent={
        message.role === "assistant"
          ? (c) => <MarkdownRenderer content={c} />
          : undefined
      }
    />
  );
});
