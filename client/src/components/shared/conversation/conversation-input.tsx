import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Flex, Box } from "@chakra-ui/react";
import { ArrowUp, Square } from "lucide-react";
import {
  IconButton,
  Tooltip,
  KeyboardHint,
  spacing,
  radii,
  shadows,
} from "@/components/shared/ui";
import { ModelSelector } from "@/components/chat/model-selector";
import { GraphifyChip } from "@/components/chat/graphify-chip";
import {
  AttachmentPickerButton,
  PendingAttachmentList,
  useComposerAttachments,
  useDropZone,
  type AttachmentRecord,
} from "./attachments";

type SendShortcut = "enter" | "cmd+enter";

interface ConversationInputProps {
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  leading?: ReactNode | null;
  sendShortcut?: SendShortcut;
  minHeight?: string;
  projectId?: string;
  conversationId?: string;
  enableAttachments?: boolean;
}

export function ConversationInput({
  onSend,
  onCancel,
  isStreaming,
  disabled,
  placeholder,
  initialValue,
  leading,
  sendShortcut = "enter",
  minHeight = "44px",
  projectId,
  conversationId,
  enableAttachments = true,
}: ConversationInputProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const attachmentsEnabled = enableAttachments && !!projectId;
  const composerAttachments = useComposerAttachments({
    projectId,
    conversationId,
  });

  const { over, dragHandlers } = useDropZone({
    onFiles: composerAttachments.addFiles,
    disabled: !attachmentsEnabled || disabled,
  });

  const MAX_HEIGHT = 450;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleSend = () => {
    const trimmed = value.trim();
    const ready = composerAttachments.readyRecords();
    const hasAttachments = ready.length > 0;
    if ((!trimmed && !hasAttachments) || isStreaming || disabled) return;
    if (composerAttachments.hasPending) return;

    onSend(trimmed, hasAttachments ? ready : undefined);
    setValue("");
    composerAttachments.clear();
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sendShortcut === "cmd+enter") {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const hasReadyAttachments = composerAttachments.items.some(
    (it) => it.status === "ready",
  );
  const canSend =
    !disabled &&
    !composerAttachments.hasPending &&
    (!!value.trim() || hasReadyAttachments);

  const hintText =
    sendShortcut === "cmd+enter" ? "\u2318+Enter" : "Shift+Enter for newline";
  const sendTooltip =
    sendShortcut === "cmd+enter" ? "Send (Cmd+Enter)" : "Send (Enter)";

  return (
    <Box
      {...(attachmentsEnabled ? dragHandlers : {})}
      css={{
        width: "100%",
        position: "relative",
        background: "var(--studio-bg-surface)",
        borderRadius: radii["2xl"],
        border: `1px solid ${
          over ? "var(--studio-border-hover)" : "var(--studio-border)"
        }`,
        transition: "all 0.2s ease",
        boxShadow: shadows.sm,
        "&:focus-within": {
          borderColor: "var(--studio-border-hover)",
          boxShadow: shadows.lg,
        },
      }}
    >
      {over && (
        <Box
          css={{
            position: "absolute",
            inset: 0,
            borderRadius: radii["2xl"],
            border: "1.5px dashed var(--studio-border-hover)",
            background: "var(--studio-bg-hover)",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      <PendingAttachmentList
        items={composerAttachments.items}
        onRemove={composerAttachments.remove}
      />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? "Type a message..."}
        disabled={disabled}
        rows={1}
        style={{
          width: "100%",
          minHeight,
          padding: `${spacing.md} ${spacing.xl}`,
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
          overflowY: "hidden",
          color: "var(--studio-text-primary)",
          fontSize: "15px",
          lineHeight: "1.6",
          fontFamily: "inherit",
          position: "relative",
          zIndex: 2,
        }}
      />

      <Flex
        align="center"
        justify="space-between"
        css={{
          padding: `0 ${spacing.sm} ${spacing.sm}`,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Flex align="center" gap="2px">
          {attachmentsEnabled && (
            <AttachmentPickerButton
              onFiles={composerAttachments.addFiles}
              disabled={disabled}
            />
          )}
          {leading === undefined ? (
            <>
              <ModelSelector />
              <GraphifyChip />
            </>
          ) : (
            leading
          )}
        </Flex>

        <Flex align="center" gap={spacing.sm}>
          <KeyboardHint keys={hintText} />

          {isStreaming && onCancel ? (
            <Tooltip content="Stop generation">
              <IconButton
                variant="danger"
                size="sm"
                onClick={onCancel}
                aria-label="Stop"
                css={{ borderRadius: radii.lg }}
              >
                <Square size={10} fill="currentColor" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip content={sendTooltip}>
              <Box
                as="button"
                onClick={canSend ? handleSend : undefined}
                css={{
                  width: "30px",
                  height: "30px",
                  borderRadius: radii.lg,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: canSend ? "pointer" : "default",
                  transition: "all 0.15s ease",
                  background: canSend
                    ? "var(--studio-accent)"
                    : "var(--studio-bg-hover)",
                  color: canSend
                    ? "var(--studio-accent-fg)"
                    : "var(--studio-text-muted)",
                  "&:hover": canSend ? { transform: "scale(1.05)" } : {},
                }}
              >
                <ArrowUp size={15} />
              </Box>
            </Tooltip>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
