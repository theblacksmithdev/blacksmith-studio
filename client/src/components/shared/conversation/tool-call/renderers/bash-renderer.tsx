import { Box, Flex } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import type { ToolCallData } from "../types";

export function BashRenderer({ call }: { call: ToolCallData }) {
  const command =
    typeof call.input.command === "string" ? call.input.command : "";
  const output = call.output ?? "";

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
        background: "var(--studio-code-bg)",
      }}
    >
      <Flex
        align="flex-start"
        gap={spacing.sm}
        css={{
          padding: `8px ${spacing.md}`,
          borderBottom: output ? "1px solid var(--studio-border)" : undefined,
          background: "var(--studio-bg-inset)",
        }}
      >
        <Box css={{ color: "var(--studio-text-muted)", paddingTop: "2px" }}>
          <ChevronRight size={13} />
        </Box>
        <Text
          variant="caption"
          css={{
            fontFamily:
              "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: "13px",
            color: "var(--studio-text-primary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            flex: 1,
          }}
        >
          {command}
        </Text>
      </Flex>
      {output && (
        <Box
          as="pre"
          css={{
            margin: 0,
            padding: `${spacing.sm} ${spacing.md}`,
            maxHeight: "280px",
            overflow: "auto",
            fontFamily:
              "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
            fontSize: "12px",
            lineHeight: "18px",
            color: "var(--studio-text-secondary)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "var(--studio-scrollbar)",
              borderRadius: "4px",
            },
          }}
        >
          {output}
        </Box>
      )}
    </Box>
  );
}
