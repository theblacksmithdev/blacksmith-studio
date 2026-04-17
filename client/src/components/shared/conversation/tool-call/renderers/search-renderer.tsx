import { Box, Flex } from "@chakra-ui/react";
import { Text, spacing, radii } from "@/components/shared/ui";
import type { ToolCallData } from "../types";

export function SearchRenderer({ call }: { call: ToolCallData }) {
  const pattern =
    typeof call.input.pattern === "string" ? call.input.pattern : "";
  const path = typeof call.input.path === "string" ? call.input.path : "";
  const output = call.output ?? "";

  const lines = output.split("\n").filter((l) => l.trim().length > 0);
  const hasResults = lines.length > 0;

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        overflow: "hidden",
      }}
    >
      <Flex
        align="center"
        gap={spacing.sm}
        css={{
          padding: `6px ${spacing.md}`,
          borderBottom: "1px solid var(--studio-border)",
          background: "var(--studio-bg-inset)",
        }}
      >
        <Text
          variant="tiny"
          css={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontWeight: 600,
            color: "var(--studio-text-primary)",
          }}
        >
          /{pattern}/
        </Text>
        {path && (
          <Text variant="tiny" color="muted">
            in {path}
          </Text>
        )}
        <Box css={{ flex: 1 }} />
        {hasResults && (
          <Text variant="tiny" color="muted">
            {lines.length} match{lines.length === 1 ? "" : "es"}
          </Text>
        )}
      </Flex>
      <Box
        css={{
          maxHeight: "240px",
          overflow: "auto",
          padding: `${spacing.xs} 0`,
          background: "var(--studio-code-bg)",
          fontFamily:
            "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace",
          fontSize: "12px",
          lineHeight: "18px",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": {
            background: "var(--studio-scrollbar)",
            borderRadius: "4px",
          },
        }}
      >
        {hasResults ? (
          lines.map((line, i) => (
            <Box
              key={i}
              css={{
                padding: `2px ${spacing.md}`,
                color: "var(--studio-text-secondary)",
                whiteSpace: "pre",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {line}
            </Box>
          ))
        ) : (
          <Box css={{ padding: `${spacing.sm} ${spacing.md}` }}>
            <Text variant="tiny" color="muted">
              No matches.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
