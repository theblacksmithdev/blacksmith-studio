import { memo, useState, type ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Copy, Check } from "lucide-react";
import {
  Text,
  IconButton,
  Tooltip,
  spacing,
  radii,
} from "@/components/shared/ui";

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Tooltip content={copied ? "Copied" : "Copy"}>
      <IconButton
        variant="ghost"
        size="xs"
        onClick={handleCopy}
        aria-label="Copy"
      >
        {copied ? <Check /> : <Copy />}
      </IconButton>
    </Tooltip>
  );
}

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  senderName?: string;
  senderIcon?: ReactNode;
  timestamp?: string;
  metadata?: ReactNode;
}

interface MessageBubbleProps {
  message: ConversationMessage;
  /** Custom content renderer for the message body (e.g. MarkdownRenderer) */
  renderContent?: (content: string) => ReactNode;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  renderContent,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = message.timestamp ? formatTime(message.timestamp) : null;

  if (isUser) {
    return (
      <Flex
        direction="column"
        align="flex-end"
        gap={spacing.xs}
        css={{
          "@keyframes bubbleIn": {
            from: { opacity: 0, transform: "translateY(4px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          animation: "bubbleIn 0.2s ease",
        }}
      >
        <Box
          css={{
            maxWidth: "75%",
            position: "relative",
            "&:hover .msg-actions": { opacity: 1 },
          }}
        >
          <Box
            css={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: `${radii["2xl"]} ${radii["2xl"]} ${radii.xs} ${radii["2xl"]}`,
              background: "var(--studio-accent)",
              color: "var(--studio-accent-fg)",
            }}
          >
            <Text
              variant="body"
              css={{
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                color: "inherit",
              }}
            >
              {message.content}
            </Text>
          </Box>
          <Flex
            className="msg-actions"
            align="center"
            gap={spacing.xs}
            css={{
              position: "absolute",
              bottom: `-${spacing.xl}`,
              right: 0,
              opacity: 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <CopyButton content={message.content} />
          </Flex>
        </Box>
        {time && (
          <Text variant="tiny" color="muted">
            {time}
          </Text>
        )}
      </Flex>
    );
  }

  // Sender message (assistant, agent, etc.)
  return (
    <Flex
      direction="column"
      gap={spacing.xs}
      css={{
        "@keyframes bubbleIn": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        animation: "bubbleIn 0.2s ease",
        position: "relative",
        "&:hover .msg-actions": { opacity: 1 },
      }}
    >
      {/* Sender header */}
      {(message.senderIcon || message.senderName) && (
        <Flex align="center" gap={spacing.sm}>
          {message.senderIcon}
          {message.senderName && (
            <Text
              variant="label"
              css={{ fontWeight: 600, color: "var(--studio-text-secondary)" }}
            >
              {message.senderName}
            </Text>
          )}
          {time && (
            <Text variant="tiny" color="muted">
              {time}
            </Text>
          )}
        </Flex>
      )}

      {/* Content */}
      <Box css={{ paddingLeft: message.senderIcon ? "30px" : 0 }}>
        {renderContent ? (
          renderContent(message.content)
        ) : (
          <Text
            variant="body"
            css={{
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              color: "var(--studio-text-primary)",
            }}
          >
            {message.content}
          </Text>
        )}
        {message.metadata}
      </Box>

      {/* Copy action */}
      <Flex
        className="msg-actions"
        align="center"
        gap={spacing.xs}
        css={{
          position: "absolute",
          top: 0,
          right: 0,
          opacity: 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <CopyButton content={message.content} />
      </Flex>
    </Flex>
  );
});
