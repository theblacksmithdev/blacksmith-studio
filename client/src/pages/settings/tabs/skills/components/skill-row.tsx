import { Flex, Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { Wand2, Trash2 } from "lucide-react";
import { Text, Badge, IconButton, Tooltip } from "@/components/shared/ui";
import type { SkillEntry } from "@/api/modules/skills";

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid var(--studio-border);
  background: transparent;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: inherit;
  transition: background 0.1s ease;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--studio-bg-surface);
    .skill-delete {
      opacity: 1;
    }
  }
`;

const DeleteBtn = styled.div`
  opacity: 0;
  transition: opacity 0.1s ease;
`;

interface SkillRowProps {
  skill: SkillEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export function SkillRow({ skill, onEdit, onDelete }: SkillRowProps) {
  return (
    <Row onClick={onEdit}>
      <Wand2
        size={14}
        style={{ color: "var(--studio-text-muted)", flexShrink: 0 }}
      />

      <Box css={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" gap="6px">
          <Text
            css={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--studio-text-primary)",
            }}
          >
            {skill.name}
          </Text>
          <Badge variant="default" size="sm">
            /{skill.name}
          </Badge>
        </Flex>
        {skill.description && (
          <Text
            css={{
              fontSize: "12px",
              color: "var(--studio-text-tertiary)",
              marginTop: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {skill.description}
          </Text>
        )}
      </Box>

      <Tooltip content="Remove skill">
        <DeleteBtn className="skill-delete">
          <IconButton
            variant="ghost"
            size="xs"
            aria-label="Remove"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={13} />
          </IconButton>
        </DeleteBtn>
      </Tooltip>
    </Row>
  );
}
