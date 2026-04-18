import { useCallback, useRef, type ReactNode } from "react";
import {
  PendingAttachmentList,
  useDropZone,
  type AttachmentRecord,
} from "../attachments";
import { ComposerShell } from "./composer-shell";
import { ComposerTextarea } from "./composer-textarea";
import { ComposerToolbar } from "./composer-toolbar";
import { useComposerState } from "./hooks/use-composer-state";
import { useTextareaAutoResize } from "./hooks/use-textarea-autoresize";
import { VARIANT_DEFAULTS, type ChatComposerVariant } from "./variants";

export interface ChatComposerProps {
  variant?: ChatComposerVariant;
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onCancel?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  leading?: ReactNode | null;
  projectId?: string;
  conversationId?: string;
  enableAttachments?: boolean;
}

export function ChatComposer({
  variant = "compact",
  onSend,
  onCancel,
  isStreaming,
  disabled,
  placeholder = "Ask Claude to build something...",
  initialValue,
  leading,
  projectId,
  conversationId,
  enableAttachments = true,
}: ChatComposerProps) {
  const { minHeight, sendShortcut } = VARIANT_DEFAULTS[variant];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const attachmentsEnabled = enableAttachments && !!projectId;

  const { reset: resetTextareaHeight } = useTextareaAutoResize(
    textareaRef,
    "",
  );

  const { value, setValue, send, handleKeyDown, canSend, attachments } =
    useComposerState({
      initialValue,
      projectId,
      conversationId,
      isStreaming,
      disabled,
      sendShortcut,
      onSend,
      onAfterSend: () => requestAnimationFrame(resetTextareaHeight),
    });

  // Keep textarea sized to the current value.
  useTextareaAutoResize(textareaRef, value);

  const { over, dragHandlers } = useDropZone({
    onFiles: attachments.addFiles,
    disabled: !attachmentsEnabled || disabled,
  });

  const onFiles = useCallback(
    (files: File[]) => attachments.addFiles(files),
    [attachments],
  );

  return (
    <ComposerShell
      over={over}
      dragHandlers={attachmentsEnabled ? dragHandlers : undefined}
    >
      <PendingAttachmentList
        items={attachments.items}
        onRemove={attachments.remove}
      />

      <ComposerTextarea
        ref={textareaRef}
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={minHeight}
      />

      <ComposerToolbar
        leading={leading}
        attachmentsEnabled={attachmentsEnabled}
        onFiles={onFiles}
        disabled={disabled}
        canSend={canSend}
        isStreaming={isStreaming}
        onSend={send}
        onCancel={onCancel}
        sendShortcut={sendShortcut}
      />
    </ComposerShell>
  );
}
