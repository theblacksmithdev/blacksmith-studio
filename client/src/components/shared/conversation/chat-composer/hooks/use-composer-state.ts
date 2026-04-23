import { useCallback } from "react";
import {
  useComposerAttachments,
  type AttachmentRecord,
} from "../../attachments";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { SendShortcut } from "../variants";

export interface UseComposerStateArgs {
  initialValue?: string;
  projectId: string | undefined;
  conversationId?: string;
  /**
   * localStorage key under which the current draft persists. `null`
   * disables persistence entirely. The caller is responsible for
   * namespacing (e.g. prefixing with `composer-draft:`) since this
   * hook treats the value opaquely.
   */
  storageKey: string | null;
  isStreaming?: boolean;
  disabled?: boolean;
  sendShortcut: SendShortcut;
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onAfterSend?: () => void;
}

/**
 * Owns the transient state of the composer: text value, attachment queue,
 * validation, send, and keyboard handling. The UI layer stays purely
 * presentational. Drafts persist across navigation / reload via
 * `usePersistedState` using the caller-provided `storageKey`.
 */
export function useComposerState({
  initialValue,
  projectId,
  conversationId,
  storageKey,
  isStreaming,
  disabled,
  sendShortcut,
  onSend,
  onAfterSend,
}: UseComposerStateArgs) {
  const [value, setValue] = usePersistedState(storageKey, initialValue ?? "");

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
  }, [value, attachments, isStreaming, disabled, onSend, onAfterSend, setValue]);

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
