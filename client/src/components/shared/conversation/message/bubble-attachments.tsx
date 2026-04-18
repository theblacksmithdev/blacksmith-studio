import { Box } from "@chakra-ui/react";
import { spacing } from "@/components/shared/ui";
import { AttachmentThumbnail } from "./attachment-thumbnail";
import type { BubbleAttachment } from "./types";

interface BubbleAttachmentsProps {
  items: BubbleAttachment[];
  onAccent?: boolean;
}

function columnsFor(count: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 4) return 2;
  return Math.min(count, 4);
}

export function BubbleAttachments({ items, onAccent }: BubbleAttachmentsProps) {
  if (items.length === 0) return null;
  const cols = columnsFor(items.length);
  const maxWidth = items.length === 1 ? "100px" : undefined;

  return (
    <Box
      css={{
        marginTop: spacing.sm,
        display: "grid",
        gap: spacing.xs,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        maxWidth,
        width: "100%",
        "--studio-attachment-shell": onAccent
          ? "rgba(255,255,255,0.12)"
          : undefined,
      }}
    >
      {items.map((item) => (
        <AttachmentThumbnail key={item.id} attachment={item} />
      ))}
    </Box>
  );
}
