import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Text, Badge } from "@/components/shared/ui";

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
  text-decoration: none;
  transition: opacity 0.12s ease;
  &:hover {
    opacity: 0.85;
  }
`;

interface SkillsHeaderProps {
  count: number;
  addPath: string;
}

export function SkillsHeader({ count, addPath }: SkillsHeaderProps) {
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
            Claude Skills
          </Text>
          {count > 0 && (
            <Badge variant="default" size="sm">
              {count}
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
          Reusable prompts that Claude can invoke with slash commands in your
          project.
        </Text>
      </Box>
      {count > 0 && (
        <AddBtn to={addPath}>
          <Plus size={13} /> Add
        </AddBtn>
      )}
    </Flex>
  );
}
