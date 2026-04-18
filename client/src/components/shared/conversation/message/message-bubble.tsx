import { memo, type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { AlertTriangle, Cpu } from "lucide-react";
import { Text, spacing } from "@/components/shared/ui";
import { BubbleShell } from "./bubble-shell";
import { BubbleHeader } from "./bubble-header";
import { BubbleBody } from "./bubble-body";
import { BubbleActions } from "./bubble-actions";
import { BubbleAttachments } from "./bubble-attachments";
import { SystemPill } from "./system-pill";
import { ThinkingBubble } from "./thinking-bubble";
import { bubbleTokens } from "./tokens";
import { formatTime } from "./format-time";
import {
  resolveVariant,
  type ConversationMessage,
  type BubbleVariant,
} from "./types";

interface MessageBubbleProps {
  message: ConversationMessage;
  renderContent?: (content: string) => ReactNode;
}

const hoverRevealCss = {
  "&:hover .msg-actions": {
    opacity: 1,
    pointerEvents: "auto" as const,
  },
};

export const MessageBubble = memo(function MessageBubble({
  message,
  renderContent,
}: MessageBubbleProps) {
  const variant = resolveVariant(message);
  const time = formatTime(message.timestamp);

  if (variant === "thinking") {
    return (
      <ThinkingBubble icon={message.senderIcon} name={message.senderName} />
    );
  }

  if (variant === "system") {
    return (
      <SystemPill
        icon={message.senderIcon ?? <Cpu size={11} />}
        content={message.content}
      />
    );
  }

  if (variant === "error") {
    return (
      <Box css={{ width: "100%", minWidth: 0, ...hoverRevealCss }}>
        <BubbleShell
          tone="error"
          align="left"
          maxWidth={bubbleTokens.maxWidthAgent}
        >
          <Flex align="flex-start" gap={spacing.sm}>
            <Box css={{ paddingTop: "2px", color: "var(--studio-error)" }}>
              <AlertTriangle size={14} />
            </Box>
            <Flex
              direction="column"
              gap={spacing.xs}
              css={{ flex: 1, minWidth: 0 }}
            >
              <Flex align="center" gap={spacing.sm}>
                <Text
                  variant="label"
                  css={{
                    fontWeight: 600,
                    color: "var(--studio-error)",
                    flex: 1,
                  }}
                >
                  {message.senderName ?? "Error"}
                </Text>
                {time && (
                  <Text variant="tiny" color="muted">
                    {time}
                  </Text>
                )}
                <BubbleActions content={message.error ?? message.content} />
              </Flex>
              <BubbleBody
                content={message.error ?? message.content}
                tone="muted"
              />
              {message.footer}
            </Flex>
          </Flex>
        </BubbleShell>
      </Box>
    );
  }

  if (variant === "user") {
    return (
      <Box
        css={{
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          ...hoverRevealCss,
        }}
      >
        <BubbleShell
          tone="user"
          align="right"
          maxWidth={bubbleTokens.maxWidthUser}
        >
          <BubbleBody content={message.content} tone="onAccent" />
          {message.attachments && message.attachments.length > 0 && (
            <BubbleAttachments items={message.attachments} onAccent />
          )}
        </BubbleShell>
        <Flex align="center" gap={spacing.xs} css={{ marginTop: spacing.xs }}>
          {time && (
            <Text variant="tiny" color="muted">
              {time}
            </Text>
          )}
          <BubbleActions content={message.content} />
        </Flex>
      </Box>
    );
  }

  const tone: "agent" | "assistant" =
    variant === "agent" ? "agent" : "assistant";

  return (
    <Box
      css={{
        width: "100%",
        minWidth: 0,
        ...hoverRevealCss,
      }}
    >
      <Flex direction="column" gap={spacing.xs} css={{ minWidth: 0 }}>
        <BubbleHeader
          icon={message.senderIcon}
          name={message.senderName}
          time={time}
          accent={message.senderAccent}
          trailing={<BubbleActions content={message.content} />}
        />
        <BubbleShell
          tone={tone}
          align="left"
          accent={message.senderAccent}
          maxWidth={tone === "agent" ? bubbleTokens.maxWidthAgent : undefined}
        >
          <BubbleBody content={message.content} renderContent={renderContent} />
          {message.attachments && message.attachments.length > 0 && (
            <BubbleAttachments items={message.attachments} />
          )}
          {message.footer}
          {message.metadata}
        </BubbleShell>
      </Flex>
    </Box>
  );
});
