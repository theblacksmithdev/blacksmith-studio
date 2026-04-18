import { useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import "yet-another-react-lightbox/styles.css";
import { Flex, Box } from "@chakra-ui/react";
import { X, ExternalLink } from "lucide-react";
import {
  useAttachmentImageUrl,
  useAttachmentText,
  useOpenAttachment,
} from "@/api/hooks/attachments";
import {
  Text,
  IconButton,
  Tooltip,
  spacing,
  radii,
  shadows,
} from "@/components/shared/ui";
import { CodeBlock } from "@/components/shared/code-block";
import type { AttachmentRecord } from "./types";

interface AttachmentPreviewModalProps {
  projectId: string;
  record: AttachmentRecord;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentPreviewModal({
  projectId,
  record,
  onClose,
}: AttachmentPreviewModalProps) {
  const isImage = record.kind === "image";
  const isText = record.kind === "text" || record.kind === "code";

  const image = useAttachmentImageUrl(
    isImage ? projectId : undefined,
    isImage ? record.absPath : undefined,
  );
  const textQuery = useAttachmentText(
    isText ? projectId : undefined,
    isText ? record.absPath : undefined,
  );
  const openMutation = useOpenAttachment();

  const handleOpenExternal = () => {
    openMutation.mutate({ projectId, absPath: record.absPath });
  };

  if (isImage) {
    if (image.isLoading) return null;
    if (!image.url) {
      return (
        <ShellModal
          record={record}
          onClose={onClose}
          onOpenExternal={handleOpenExternal}
          error={
            image.isError
              ? (image.error as Error | undefined)?.message ??
                "Unable to load image"
              : "Unable to load image"
          }
        />
      );
    }
    return (
      <Lightbox
        open
        close={onClose}
        slides={[{ src: image.url, alt: record.name, download: image.url }]}
        plugins={[Zoom, Fullscreen, Download]}
        carousel={{ finite: true }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.85)" } }}
        zoom={{ maxZoomPixelRatio: 5, scrollToZoom: true }}
      />
    );
  }

  const textError = isText
    ? textQuery.isError
      ? (textQuery.error as Error | undefined)?.message ??
        "Failed to read file"
      : textQuery.tooLarge
        ? "File is too large to preview inline."
        : null
    : "Preview not supported for this file type.";

  return (
    <ShellModal
      record={record}
      onClose={onClose}
      onOpenExternal={handleOpenExternal}
      error={textError}
    >
      {isText && textQuery.isLoading && (
        <Flex
          align="center"
          justify="center"
          css={{ padding: spacing["4xl"] }}
        >
          <Text variant="caption" color="muted">
            Loading preview...
          </Text>
        </Flex>
      )}
      {isText && !textError && textQuery.text !== null && (
        <CodeBlock
          code={textQuery.text}
          filename={record.name}
          showLineNumbers
          maxHeight="calc(88vh - 140px)"
        />
      )}
    </ShellModal>
  );
}

interface ShellModalProps {
  record: AttachmentRecord;
  onClose: () => void;
  onOpenExternal: () => void;
  error?: string | null;
  children?: React.ReactNode;
}

function ShellModal({
  record,
  onClose,
  onOpenExternal,
  error,
  children,
}: ShellModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Box
      onClick={onClose}
      css={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--studio-backdrop)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        css={{
          width: "100%",
          maxWidth: "860px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--studio-bg-main)",
          border: "1px solid var(--studio-border)",
          borderRadius: radii["2xl"],
          overflow: "hidden",
          boxShadow: shadows.lg,
        }}
      >
        <Flex
          align="center"
          gap={spacing.md}
          css={{
            padding: `10px ${spacing.md} 10px ${spacing.lg}`,
            borderBottom: "1px solid var(--studio-border)",
            background: "var(--studio-bg-sidebar)",
          }}
        >
          <Box css={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="bodySmall"
              css={{
                fontWeight: 600,
                color: "var(--studio-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.name}
            </Text>
            <Text variant="tiny" color="muted" css={{ fontWeight: 500 }}>
              {record.kind.toUpperCase()} · {formatSize(record.size)}
            </Text>
          </Box>
          <Tooltip content="Open in default app">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onOpenExternal}
              aria-label="Open in default app"
            >
              <ExternalLink />
            </IconButton>
          </Tooltip>
          <Tooltip content="Close">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close"
            >
              <X />
            </IconButton>
          </Tooltip>
        </Flex>

        <Box
          css={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: spacing.md,
            background: "var(--studio-bg-main)",
          }}
        >
          {error ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap={spacing.md}
              css={{ padding: spacing["4xl"] }}
            >
              <Text variant="caption" color="muted">
                {error}
              </Text>
              <Box
                as="button"
                onClick={onOpenExternal}
                css={{
                  padding: `6px ${spacing.md}`,
                  borderRadius: radii.md,
                  background: "var(--studio-accent)",
                  color: "var(--studio-accent-fg)",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Open in default app
              </Box>
            </Flex>
          ) : (
            children
          )}
        </Box>
      </Box>
    </Box>
  );
}
