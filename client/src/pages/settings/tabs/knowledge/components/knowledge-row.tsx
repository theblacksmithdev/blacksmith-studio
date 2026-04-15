import { Flex, Box } from "@chakra-ui/react";
import { FileText, Pencil, Trash2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Text, Menu, IconButton } from "@/components/shared/ui";
import type { MenuOption } from "@/components/shared/ui";

interface KnowledgeRowProps {
  name: string;
  size: number;
  updatedAt: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function KnowledgeRow({
  name,
  size,
  updatedAt,
  onEdit,
  onDelete,
}: KnowledgeRowProps) {
  const menuOptions: MenuOption[] = [
    { icon: <Pencil />, label: "Edit", onClick: onEdit },
    {
      icon: <Trash2 />,
      label: "Delete",
      onClick: onDelete,
      danger: true,
      separator: true,
    },
  ];

  return (
    <Flex
      align="center"
      gap="12px"
      onClick={onEdit}
      css={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--studio-border)",
        transition: "background 0.1s ease",
        cursor: "pointer",
        "&:last-child": { borderBottom: "none" },
        "&:hover": { background: "var(--studio-bg-surface)" },
      }}
    >
      <FileText
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
            {name}
          </Text>
        </Flex>
        <Text
          css={{
            fontSize: "11px",
            color: "var(--studio-text-muted)",
            marginTop: "1px",
          }}
        >
          {(size / 1024).toFixed(1)} KB ·{" "}
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </Text>
      </Box>

      <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Menu
          trigger={
            <IconButton variant="ghost" size="xs" aria-label="Options">
              <MoreVertical size={14} />
            </IconButton>
          }
          options={menuOptions}
        />
      </Box>
    </Flex>
  );
}
