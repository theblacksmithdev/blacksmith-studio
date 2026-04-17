import type { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { Copy, Check } from "lucide-react";
import { IconButton, Tooltip, spacing } from "@/components/shared/ui";
import { useCopy } from "./use-copy";

interface BubbleActionsProps {
  content: string;
  extra?: ReactNode;
  alwaysVisible?: boolean;
}

export function BubbleActions({
  content,
  extra,
  alwaysVisible,
}: BubbleActionsProps) {
  const { copied, copy } = useCopy();

  return (
    <Flex
      className="msg-actions"
      align="center"
      gap={spacing.xs}
      css={{
        opacity: alwaysVisible ? 1 : 0,
        pointerEvents: alwaysVisible ? "auto" : "none",
        transition: "opacity 0.12s ease",
      }}
    >
      <Tooltip content={copied ? "Copied" : "Copy"}>
        <IconButton
          variant="ghost"
          size="xs"
          onClick={() => copy(content)}
          aria-label="Copy"
        >
          {copied ? <Check /> : <Copy />}
        </IconButton>
      </Tooltip>
      {extra}
    </Flex>
  );
}
