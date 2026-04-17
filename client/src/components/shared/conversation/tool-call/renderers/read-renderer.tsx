import { Box } from "@chakra-ui/react";
import { Text, spacing } from "@/components/shared/ui";
import { CodeBlock } from "@/components/shared/code-block";
import type { ToolCallData } from "../types";

export function ReadRenderer({ call }: { call: ToolCallData }) {
  const filePath =
    typeof call.input.file_path === "string"
      ? call.input.file_path
      : typeof call.input.path === "string"
        ? call.input.path
        : undefined;
  const output = call.output ?? "";

  if (!output.trim()) {
    return (
      <Box
        css={{
          padding: `${spacing.sm} ${spacing.md}`,
          color: "var(--studio-text-muted)",
        }}
      >
        <Text variant="tiny">Reading {filePath || "file"}...</Text>
      </Box>
    );
  }

  return (
    <CodeBlock
      code={output}
      filename={filePath}
      showLineNumbers
      maxHeight={320}
    />
  );
}
