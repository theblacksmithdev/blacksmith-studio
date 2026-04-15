import { Flex, Box } from "@chakra-ui/react";
import { GitCompareArrows, FileCode2, X } from "lucide-react";
import {
  Text,
  IconButton,
  Tooltip,
  spacing,
  radii,
} from "@/components/shared/ui";
import { FileIcon } from "@/pages/files/components/explorer/utils/file-icon";
import { FONT } from "../../../hooks";

interface NoFileSelectedProps {
  /* intentionally empty */
}

export function NoFileSelected(_props: NoFileSelectedProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={spacing.md}
      css={{ flex: 1 }}
    >
      <Box
        css={{
          width: "48px",
          height: "48px",
          borderRadius: radii.xl,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--studio-bg-surface)",
          border: "1px solid var(--studio-border)",
          color: "var(--studio-text-muted)",
        }}
      >
        <GitCompareArrows size={22} />
      </Box>
      <Flex direction="column" align="center" gap={spacing.xs}>
        <Text variant="subtitle">No file selected</Text>
        <Text variant="bodySmall" color="muted">
          Click a changed file on the left to compare versions
        </Text>
      </Flex>
    </Flex>
  );
}

interface NoChangesProps {
  filePath: string;
  onClose?: () => void;
}

export function NoChanges({ filePath, onClose }: NoChangesProps) {
  const fileName = filePath.split("/").pop() || filePath;

  return (
    <>
      <Flex
        align="center"
        gap={spacing.sm}
        css={{
          padding: `${spacing.xs} ${spacing.md}`,
          borderBottom: "1px solid var(--studio-border)",
          background: "var(--studio-bg-sidebar)",
          flexShrink: 0,
          minHeight: "36px",
        }}
      >
        <FileIcon name={fileName} size={14} />
        <Text
          variant="bodySmall"
          css={{
            fontFamily: FONT,
            fontSize: "12px",
            flex: 1,
            color: "var(--studio-text-secondary)",
          }}
        >
          {filePath}
        </Text>
        {onClose && (
          <Tooltip content="Close diff">
            <IconButton
              variant="ghost"
              size="xs"
              onClick={onClose}
              aria-label="Close diff"
            >
              <X />
            </IconButton>
          </Tooltip>
        )}
      </Flex>
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={spacing.sm}
        css={{ flex: 1 }}
      >
        <FileCode2
          size={20}
          style={{ color: "var(--studio-text-muted)", opacity: 0.4 }}
        />
        <Text variant="bodySmall" color="muted">
          No changes to display
        </Text>
      </Flex>
    </>
  );
}
