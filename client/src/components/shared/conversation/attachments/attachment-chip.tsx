import { Flex, Box } from "@chakra-ui/react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { Text, spacing, radii } from "@/components/shared/ui";
import { getFileIcon } from "@/components/shared/code-block";
import type { PendingAttachment } from "./types";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface AttachmentChipProps {
  item: PendingAttachment;
  onRemove: (localId: string) => void;
}

export function AttachmentChip({ item, onRemove }: AttachmentChipProps) {
  const Icon = getFileIcon(item.kind, item.name);
  const isError = item.status === "error";
  const isUploading = item.status === "uploading";

  return (
    <Flex
      align="center"
      gap={spacing.xs}
      css={{
        padding: `4px ${spacing.xs} 4px ${spacing.sm}`,
        borderRadius: radii.md,
        border: `1px solid ${
          isError ? "var(--studio-error)" : "var(--studio-border)"
        }`,
        background: isError
          ? "var(--studio-error-subtle)"
          : "var(--studio-bg-inset)",
        maxWidth: "280px",
        minWidth: 0,
        flexShrink: 0,
      }}
      title={item.error ?? item.name}
    >
      {isUploading ? (
        <Loader2
          size={12}
          style={{
            color: "var(--studio-text-muted)",
            flexShrink: 0,
            animation: "studio-spin 0.9s linear infinite",
          }}
        />
      ) : isError ? (
        <AlertTriangle
          size={12}
          style={{ color: "var(--studio-error)", flexShrink: 0 }}
        />
      ) : (
        <Icon
          size={13}
          style={{
            color: "var(--studio-text-secondary)",
            flexShrink: 0,
          }}
        />
      )}

      <Text
        variant="caption"
        css={{
          fontWeight: 500,
          color: isError ? "var(--studio-error)" : "var(--studio-text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
        }}
      >
        {item.name}
      </Text>

      {!isError && (
        <Text variant="tiny" color="muted" css={{ fontSize: "10px" }}>
          {formatSize(item.size)}
        </Text>
      )}

      <Box
        as="button"
        onClick={() => onRemove(item.localId)}
        aria-label="Remove attachment"
        css={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "18px",
          height: "18px",
          borderRadius: "999px",
          background: "transparent",
          border: "none",
          color: "var(--studio-text-muted)",
          cursor: "pointer",
          flexShrink: 0,
          "&:hover": {
            color: "var(--studio-text-primary)",
            background: "var(--studio-bg-hover)",
          },
        }}
      >
        <X size={11} />
      </Box>

      <style>{`
        @keyframes studio-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Flex>
  );
}
