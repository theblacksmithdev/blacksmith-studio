import { Flex, Box } from "@chakra-ui/react";
import { Folder, FolderOpen } from "lucide-react";
import { Text } from "@/components/shared/ui";
import { FileIcon } from "./file-icon";

interface FileLabelProps {
  name: string;
  isDir?: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  iconSize?: number;
  fontSize?: string;
}

/**
 * Reusable file/folder label: icon + name.
 * Used in the tree node, file tabs, breadcrumbs, etc.
 */
export function FileLabel({
  name,
  isDir = false,
  isOpen = false,
  isSelected = false,
  iconSize = 15,
  fontSize = "13px",
}: FileLabelProps) {
  return (
    <Flex align="center" gap="4px" css={{ minWidth: 0 }}>
      <Box css={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
        {isDir ? (
          <Box css={{ color: "#f59e0b" }}>
            {isOpen ? (
              <FolderOpen size={iconSize} />
            ) : (
              <Folder size={iconSize} />
            )}
          </Box>
        ) : (
          <FileIcon name={name} size={iconSize} />
        )}
      </Box>
      <Text
        variant="bodySmall"
        truncate
        css={{
          fontSize,
          color: isSelected
            ? "var(--studio-text-primary)"
            : "var(--studio-text-secondary)",
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {name}
      </Text>
    </Flex>
  );
}
