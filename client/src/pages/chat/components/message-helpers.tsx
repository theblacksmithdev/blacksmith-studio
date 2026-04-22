import { Flex } from "@chakra-ui/react";
import {
  type ConversationMessage,
  type BubbleAttachment,
  type AttachmentRecord,
} from "@/components/shared/conversation";
import { ToolCallCard } from "@/components/chat/tool-call-card";
import { ClaudeIcon } from "./claude-icon";
import { spacing } from "@/components/shared/ui";
import type { Message, MessageAttachment } from "@/types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function bubbleKindFor(
  kind: MessageAttachment["kind"],
): NonNullable<BubbleAttachment["kind"]> {
  if (kind === "image") return "image";
  if (kind === "code") return "code";
  return "file";
}

export function toAttachmentRecord(a: MessageAttachment): AttachmentRecord {
  return {
    id: a.id,
    name: a.name,
    kind: a.kind,
    mime: a.mime,
    size: a.size,
    absPath: a.absPath,
    relPath: a.relPath,
    conversationId: null,
    createdAt: "",
  };
}

export function toBubbleAttachments(
  items: MessageAttachment[] | undefined,
  projectId: string | undefined,
  onOpen: (record: AttachmentRecord) => void,
): BubbleAttachment[] | undefined {
  if (!items || items.length === 0) return undefined;
  return items.map((a) => ({
    id: a.id,
    name: a.name,
    kind: bubbleKindFor(a.kind),
    meta: formatSize(a.size),
    projectId,
    absPath: a.absPath,
    onClick: () => onOpen(toAttachmentRecord(a)),
  }));
}

export function toConversationMessages(
  messages: Message[],
  projectId: string | undefined,
  onOpenAttachment: (record: AttachmentRecord) => void,
): ConversationMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    senderName: msg.role === "assistant" ? "Claude" : undefined,
    senderIcon: msg.role === "assistant" ? <ClaudeIcon /> : undefined,
    attachments: toBubbleAttachments(
      msg.attachments,
      projectId,
      onOpenAttachment,
    ),
    metadata:
      msg.toolCalls && msg.toolCalls.length > 0 ? (
        <Flex
          direction="column"
          gap={spacing.xs}
          css={{ marginTop: spacing.sm }}
        >
          {msg.toolCalls.map((tc) => (
            <ToolCallCard key={tc.toolId} toolCall={tc} />
          ))}
        </Flex>
      ) : undefined,
  }));
}
