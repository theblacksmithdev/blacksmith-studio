import { Box } from "@chakra-ui/react";
import { Text, spacing } from "@/components/shared/ui";
import type { ToolCallData } from "./types";
import { EditRenderer } from "./renderers/edit-renderer";
import { WriteRenderer } from "./renderers/write-renderer";
import { ReadRenderer } from "./renderers/read-renderer";
import { BashRenderer } from "./renderers/bash-renderer";
import { SearchRenderer } from "./renderers/search-renderer";
import { WebRenderer } from "./renderers/web-renderer";
import { GenericRenderer } from "./renderers/generic-renderer";

function routeRenderer(call: ToolCallData) {
  switch (call.toolName) {
    case "Edit":
    case "MultiEdit":
      return <EditRenderer call={call} />;
    case "Write":
      return <WriteRenderer call={call} />;
    case "Read":
      return <ReadRenderer call={call} />;
    case "Bash":
      return <BashRenderer call={call} />;
    case "Grep":
    case "Glob":
      return <SearchRenderer call={call} />;
    case "WebFetch":
    case "WebSearch":
      return <WebRenderer call={call} />;
    default:
      return <GenericRenderer call={call} />;
  }
}

export function ToolBody({ call }: { call: ToolCallData }) {
  return (
    <Box
      css={{
        padding: spacing.sm,
        borderTop: "1px solid var(--studio-border)",
        background: "var(--studio-bg-main)",
      }}
    >
      {call.error && (
        <Box
          css={{
            padding: `${spacing.xs} ${spacing.md}`,
            marginBottom: spacing.sm,
            borderRadius: "8px",
            background: "var(--studio-error-subtle)",
            border: "1px solid var(--studio-error)",
          }}
        >
          <Text
            variant="tiny"
            css={{ color: "var(--studio-error)", fontWeight: 500 }}
          >
            {call.error}
          </Text>
        </Box>
      )}
      {routeRenderer(call)}
    </Box>
  );
}
