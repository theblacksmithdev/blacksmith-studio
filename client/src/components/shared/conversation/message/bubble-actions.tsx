import type { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { Copy, Check } from "lucide-react";
import { IconButton, Tooltip, spacing } from "@/components/shared/ui";
import { useCopy } from "./use-copy";

interface BubbleActionsProps {
  content: string;
  align?: "left" | "right";
  position?: "top" | "bottom";
  extra?: ReactNode;
}

export function BubbleActions({
  content,
  align = "left",
  position = "top",
  extra,
}: BubbleActionsProps) {
  const { copied, copy } = useCopy();

  const positional =
    position === "top"
      ? { top: 0 }
      : { bottom: `calc(-1 * ${spacing.xl})` };

  const lateral =
    align === "right" ? { right: 0 } : { left: 0 };

  return (
    <Flex
      className="msg-actions"
      align="center"
      gap={spacing.xs}
      css={{
        position: "absolute",
        ...positional,
        ...lateral,
        opacity: 0,
        transform: "translateY(-4px)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        pointerEvents: "none",
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
