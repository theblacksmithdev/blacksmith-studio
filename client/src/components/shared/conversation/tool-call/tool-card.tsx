import { memo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { radii } from "@/components/shared/ui";
import { ToolHeader } from "./tool-header";
import { ToolBody } from "./tool-body";
import { describeTool } from "./tool-registry";
import type { ToolCallData, ToolStatus } from "./types";

interface ToolCardProps {
  call: ToolCallData;
  isActive?: boolean;
  defaultExpanded?: boolean;
}

function resolveStatus(call: ToolCallData, isActive?: boolean): ToolStatus {
  if (call.status) return call.status;
  if (call.error) return "error";
  if (isActive) return "running";
  if (call.output !== undefined) return "done";
  return "pending";
}

export const ToolCard = memo(function ToolCard({
  call,
  isActive,
  defaultExpanded = false,
}: ToolCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const descriptor = describeTool(call.toolName);
  const status = resolveStatus(call, isActive);
  const summary = descriptor.summarize(call.input) || descriptor.label;

  return (
    <Box
      css={{
        borderRadius: radii.md,
        border: "1px solid var(--studio-border)",
        background: "var(--studio-bg-surface)",
        overflow: "hidden",
        transition: "border-color 0.12s ease, background 0.12s ease",
        "&:hover": {
          borderColor: "var(--studio-border-hover)",
        },
      }}
    >
      <ToolHeader
        descriptor={descriptor}
        summary={summary}
        status={status}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />
      {expanded && <ToolBody call={call} />}
    </Box>
  );
});
