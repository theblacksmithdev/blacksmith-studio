import { useCallback, useState } from "react";
import {
  useComposerAttachments,
  type AttachmentRecord,
} from "../../attachments";
import type { SendShortcut } from "../variants";

export interface UseComposerStateArgs {
  initialValue?: string;
  projectId: string | undefined;
  conversationId?: string;
  isStreaming?: boolean;
  disabled?: boolean;
  sendShortcut: SendShortcut;
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onAfterSend?: () => void;
}

/**
 * Owns the transient state of the composer: text value, attachment queue,
 * validation, send, and keyboard handling. The UI layer stays purely
 * presentational.
 */
export function useComposerState({
  initialValue,
  projectId,
  conversationId,
  isStreaming,
  disabled,
  sendShortcut,
  onSend,
  onAfterSend,
}: UseComposerStateArgs) {
  const [value, setValue] = useState(initialValue ?? "");
  const attachments = useComposerAttachments({ projectId, conversationId });

  const hasReadyAttachments = attachments.items.some(
    (it) => it.status === "ready",
  );
  const canSend =
    !disabled &&
    !attachments.hasPending &&
    (!!value.trim() || hasReadyAttachments);

  const send = useCallback(() => {
    const trimmed = value.trim();
    const ready = attachments.readyRecords();
    const hasAttachments = ready.length > 0;
    if ((!trimmed && !hasAttachments) || isStreaming || disabled) return;
    if (attachments.hasPending) return;

    onSend(trimmed, hasAttachments ? ready : undefined);
    setValue("");
    attachments.clear();
    onAfterSend?.();
  }, [value, attachments, isStreaming, disabled, onSend, onAfterSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (sendShortcut === "cmd+enter") {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          send();
        }
      } else {
        if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          send();
        }
      }
    },
    [sendShortcut, send],
  );

  return {
    value,
    setValue,
    send,
    handleKeyDown,
    canSend,
    attachments,
  };
}
