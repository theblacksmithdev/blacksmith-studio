import type { ReactNode } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Copy, Check } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { useCopy } from "./use-copy";

interface SystemPillProps {
  icon?: ReactNode;
  content: string;
  tone?: "neutral" | "error";
}

export function SystemPill({
  icon,
  content,
  tone = "neutral",
}: SystemPillProps) {
  const error = tone === "error";
  const { copied, copy } = useCopy();

  return (
    <Flex justify="center" css={{ width: "100%" }}>
      <Flex
        align="center"
        gap={spacing.xs}
        css={{
          padding: `4px 4px 4px ${spacing.md}`,
          borderRadius: radii.full,
          background: error
            ? "var(--studio-error-subtle)"
            : "var(--studio-bg-surface)",
          border: `1px solid ${
            error ? "var(--studio-error)" : "var(--studio-border)"
          }`,
          color: error ? "var(--studio-error)" : "var(--studio-text-secondary)",
          maxWidth: "80%",
          "&:hover .system-pill-copy": {
            opacity: 1,
          },
        }}
      >
        {icon}
        <Text
          variant="caption"
          css={{
            fontWeight: 500,
            color: "inherit",
            fontSize: "12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {content}
        </Text>
        <Box
          as="button"
          className="system-pill-copy"
          onClick={() => copy(content)}
          aria-label="Copy"
          css={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "18px",
            height: "18px",
            borderRadius: "999px",
            background: "transparent",
            border: "none",
            color: "inherit",
            opacity: copied ? 1 : 0,
            transition: "opacity 0.12s ease, background 0.12s ease",
            cursor: "pointer",
            flexShrink: 0,
            "&:hover": {
              background: error
                ? "rgba(211,47,47,0.12)"
                : "var(--studio-bg-hover)",
            },
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
        </Box>
      </Flex>
    </Flex>
  );
}
