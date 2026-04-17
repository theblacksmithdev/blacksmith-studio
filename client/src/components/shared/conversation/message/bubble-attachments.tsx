import styled from "@emotion/styled";
import { Flex } from "@chakra-ui/react";
import { Paperclip, Link2, Image, FileCode, FileText } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import type { BubbleAttachment } from "./types";

interface BubbleAttachmentsProps {
  items: BubbleAttachment[];
  onAccent?: boolean;
}

const Chip = styled.a<{ $onAccent?: boolean; $clickable?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  padding: 4px ${spacing.sm};
  border-radius: ${radii.md};
  border: 1px solid
    ${({ $onAccent }) =>
      $onAccent ? "rgba(255,255,255,0.2)" : "var(--studio-border)"};
  background: ${({ $onAccent }) =>
    $onAccent ? "rgba(255,255,255,0.08)" : "var(--studio-bg-inset)"};
  color: inherit;
  text-decoration: none;
  font: inherit;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition:
    background 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    ${({ $clickable, $onAccent }) =>
      $clickable
        ? `
      background: ${$onAccent ? "rgba(255,255,255,0.14)" : "var(--studio-bg-hover)"};
      border-color: ${$onAccent ? "rgba(255,255,255,0.3)" : "var(--studio-border-hover)"};
    `
        : ""}
  }
`;

function iconFor(kind: BubbleAttachment["kind"]) {
  switch (kind) {
    case "image":
      return <Image size={12} />;
    case "link":
      return <Link2 size={12} />;
    case "code":
      return <FileCode size={12} />;
    case "file":
      return <FileText size={12} />;
    default:
      return <Paperclip size={12} />;
  }
}

export function BubbleAttachments({ items, onAccent }: BubbleAttachmentsProps) {
  if (items.length === 0) return null;

  return (
    <Flex wrap="wrap" gap={spacing.xs} css={{ marginTop: spacing.sm }}>
      {items.map((att) => {
        const clickable = !!att.onClick || !!att.href;
        return (
          <Chip
            key={att.id}
            href={att.href}
            target={att.href ? "_blank" : undefined}
            rel={att.href ? "noreferrer" : undefined}
            onClick={att.onClick}
            $onAccent={onAccent}
            $clickable={clickable}
          >
            {att.icon ?? iconFor(att.kind)}
            <Text variant="tiny" css={{ fontWeight: 500, color: "inherit" }}>
              {att.name}
            </Text>
            {att.meta && (
              <Text
                variant="tiny"
                color="muted"
                css={{ opacity: onAccent ? 0.7 : 1 }}
              >
                {att.meta}
              </Text>
            )}
          </Chip>
        );
      })}
    </Flex>
  );
}
