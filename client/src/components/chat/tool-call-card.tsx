import { memo } from "react";
import { ToolCard } from "@/components/shared/conversation/tool-call";
import type { ToolCall } from "@/types";

interface ToolCallCardProps {
  toolCall: ToolCall;
  isActive?: boolean;
}

export const ToolCallCard = memo(function ToolCallCard({
  toolCall,
  isActive,
}: ToolCallCardProps) {
  return (
    <ToolCard
      call={{
        toolId: toolCall.toolId,
        toolName: toolCall.toolName,
        input: toolCall.input,
        output: toolCall.output,
      }}
      isActive={isActive}
    />
  );
});
