import { Flex } from "@chakra-ui/react";
import { spacing } from "@/components/shared/ui";
import { AttachmentChip } from "./attachment-chip";
import type { PendingAttachment } from "./types";

interface PendingAttachmentListProps {
  items: PendingAttachment[];
  onRemove: (localId: string) => void;
}

export function PendingAttachmentList({
  items,
  onRemove,
}: PendingAttachmentListProps) {
  if (items.length === 0) return null;

  return (
    <Flex
      wrap="wrap"
      gap={spacing.xs}
      css={{
        padding: `${spacing.sm} ${spacing.md} 0`,
      }}
    >
      {items.map((item) => (
        <AttachmentChip key={item.localId} item={item} onRemove={onRemove} />
      ))}
    </Flex>
  );
}
