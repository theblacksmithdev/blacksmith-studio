import styled from "@emotion/styled";
import { Box } from "@chakra-ui/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Text, spacing } from "@/components/shared/ui";
import { ToolStatusDot } from "./tool-status-dot";
import type { ToolDescriptor, ToolStatus } from "./types";

const HeaderButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  width: 100%;
  padding: ${spacing.xs} ${spacing.md};
  background: transparent;
  border: none;
  text-align: left;
  font-family: inherit;
  color: inherit;

  &:not(:disabled) {
    cursor: pointer;
  }
`;

interface ToolHeaderProps {
  descriptor: ToolDescriptor;
  summary: string;
  status: ToolStatus;
  expanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ToolHeader({
  descriptor,
  summary,
  status,
  expanded,
  onToggle,
  disabled,
}: ToolHeaderProps) {
  const Icon = descriptor.icon;

  return (
    <HeaderButton
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      <ToolStatusDot status={status} />

      <Box
        css={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          background: "var(--studio-bg-inset)",
          color: "var(--studio-text-secondary)",
          flexShrink: 0,
        }}
      >
        <Icon size={12} />
      </Box>

      <Text
        variant="tiny"
        css={{
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--studio-text-secondary)",
          fontSize: "10px",
          flexShrink: 0,
        }}
      >
        {descriptor.label}
      </Text>

      <Text
        variant="caption"
        css={{
          flex: 1,
          minWidth: 0,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: "12px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--studio-text-primary)",
          opacity: 0.9,
        }}
      >
        {summary}
      </Text>

      {!disabled && (
        <Box
          css={{
            color: "var(--studio-text-muted)",
            flexShrink: 0,
          }}
        >
          {expanded ? (
            <ChevronDown size={12} />
          ) : (
            <ChevronRight size={12} />
          )}
        </Box>
      )}
    </HeaderButton>
  );
}
