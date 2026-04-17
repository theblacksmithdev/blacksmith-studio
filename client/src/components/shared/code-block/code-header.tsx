import { Flex, Box } from "@chakra-ui/react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { useCopy } from "@/components/shared/conversation/message/use-copy";
import { shortFilename } from "./language";
import { getFileIcon } from "./file-icon";

interface CodeHeaderProps {
  filename?: string;
  language?: string;
  code: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}

export function CodeHeader({
  filename,
  language,
  code,
  collapsible,
  collapsed,
  onToggle,
}: CodeHeaderProps) {
  const { copied, copy } = useCopy();
  const displayName = filename ? shortFilename(filename) : language || "code";
  const FileIcon = getFileIcon(language, filename);

  return (
    <Flex
      align="center"
      gap={spacing.sm}
      css={{
        padding: `6px ${spacing.sm} 6px ${spacing.md}`,
        borderBottom: "1px solid var(--studio-border)",
        background: "var(--studio-bg-inset)",
        userSelect: "none",
      }}
    >
      {collapsible && (
        <Box
          as="button"
          onClick={onToggle}
          css={{
            display: "inline-flex",
            alignItems: "center",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "var(--studio-text-muted)",
          }}
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </Box>
      )}

      <FileIcon
        size={13}
        style={{ color: "var(--studio-text-secondary)", flexShrink: 0 }}
      />

      <Text
        variant="caption"
        css={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontWeight: 500,
          color: "var(--studio-text-primary)",
          textTransform: "none",
          letterSpacing: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
        }}
      >
        {displayName}
      </Text>

      {filename && language && (
        <Text
          variant="tiny"
          css={{
            color: "var(--studio-text-muted)",
            fontWeight: 500,
          }}
        >
          {language}
        </Text>
      )}

      <Box
        as="button"
        onClick={() => copy(code)}
        aria-label="Copy code"
        css={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: `2px ${spacing.xs}`,
          borderRadius: radii.sm,
          background: "transparent",
          border: "none",
          color: copied
            ? "var(--studio-text-primary)"
            : "var(--studio-text-muted)",
          fontSize: "11px",
          cursor: "pointer",
          transition: "color 0.12s ease, background 0.12s ease",
          "&:hover": {
            color: "var(--studio-text-primary)",
            background: "var(--studio-bg-hover)",
          },
        }}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? "Copied" : "Copy"}
      </Box>
    </Flex>
  );
}
