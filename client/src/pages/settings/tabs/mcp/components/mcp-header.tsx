import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Plus } from "lucide-react";
import { Text, Badge } from "@/components/shared/ui";
import { Link } from "react-router-dom";

const AddBtn = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
  &:hover {
    opacity: 0.85;
  }
`;

interface McpHeaderProps {
  serverCount: number;
  enabledCount: number;
  addPath: string;
}

export function McpHeader({
  serverCount,
  enabledCount,
  addPath,
}: McpHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start">
      <Box>
        <Flex align="center" gap="8px" css={{ marginBottom: "4px" }}>
          <Text
            css={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--studio-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            MCP Servers
          </Text>
          {serverCount > 0 && (
            <Badge variant="default" size="sm">
              {enabledCount}/{serverCount} active
            </Badge>
          )}
        </Flex>
        <Text
          css={{
            fontSize: "13px",
            color: "var(--studio-text-tertiary)",
            lineHeight: 1.5,
          }}
        >
          External tools and data sources that extend Claude's capabilities
          through the Model Context Protocol.
        </Text>
      </Box>
      {serverCount > 0 && (
        <AddBtn to={addPath}>
          <Plus size={13} /> Add
        </AddBtn>
      )}
    </Flex>
  );
}
