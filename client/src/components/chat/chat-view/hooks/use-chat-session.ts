import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSessionQuery } from "@/api/hooks/sessions";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useChatStore } from "@/stores/chat-store";
import { useSessionStore } from "@/stores/session-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { toConversationMessages } from "../message-helpers";
import type { AttachmentRecord } from "@/components/shared/conversation";

/**
 * Manages loading/resuming a chat session, sending prompts,
 * and transforming messages for the conversation view.
 *
 * Message sources:
 *  - `session.messages`  — persisted history from React Query (source of truth)
 *  - `pendingMessages`   — optimistic in-flight messages (user prompt + assistant
 *                          response) shown until the RQ refetch catches up
 */
export function useChatSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const projectId = useActiveProjectId();
  const { sendPrompt, cancelPrompt } = useAiChat();
  const { isStreaming, partialMessage, pendingMessages, clearPendingMessages } =
    useChatStore();
  const { activeSessionId, setActiveSession } = useSessionStore();

  const { data: session } = useSessionQuery(sessionId);
  const sessionMessages = session?.messages ?? [];

  // Clear stale pending messages when switching BETWEEN sessions, but not on
  // initial mount — navigating from chat/new with a freshly-added pending
  // message would otherwise clear it before it's visible.
  const prevSessionIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (
      prevSessionIdRef.current !== undefined &&
      prevSessionIdRef.current !== sessionId
    ) {
      clearPendingMessages();
    }
    prevSessionIdRef.current = sessionId;
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Once React Query refetches and delivers updated session messages, the
  // pending messages are now in the DB — safe to discard the optimistic copies
  useEffect(() => {
    if (sessionMessages.length > 0) {
      clearPendingMessages();
    }
  }, [sessionMessages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync active session ID with the session store
  useEffect(() => {
    if (session && session.id !== activeSessionId) {
      setActiveSession(session.id);
    }
  }, [session, sessionId, activeSessionId]);

  // Auto-send initial prompt from route state (e.g. from template or quick action)
  const initialPromptSent = useRef(false);
  useEffect(() => {
    const state = location.state as { initialPrompt?: string } | null;
    if (
      state?.initialPrompt &&
      sessionId &&
      !initialPromptSent.current &&
      !isStreaming
    ) {
      initialPromptSent.current = true;
      sendPrompt(state.initialPrompt, sessionId);
    }
  }, [sessionId, location.state]);

  const handleSend = useCallback(
    (text: string, attachments?: AttachmentRecord[]) => {
      if (!sessionId) return;
      sendPrompt(text, sessionId, attachments);
    },
    [sessionId, sendPrompt],
  );

  const handleCancel = useCallback(() => {
    if (sessionId) cancelPrompt(sessionId);
  }, [sessionId, cancelPrompt]);

  const [previewAttachment, setPreviewAttachment] =
    useState<AttachmentRecord | null>(null);

  const openAttachment = useCallback((record: AttachmentRecord) => {
    setPreviewAttachment(record);
  }, []);

  const closeAttachment = useCallback(() => {
    setPreviewAttachment(null);
  }, []);

  // Merge persisted history with optimistic pending messages
  const allMessages = useMemo(
    () => [...sessionMessages, ...pendingMessages],
    [sessionMessages, pendingMessages],
  );

  const conversationMessages = useMemo(
    () =>
      toConversationMessages(
        allMessages,
        projectId ?? undefined,
        openAttachment,
      ),
    [allMessages, projectId, openAttachment],
  );

  return {
    sessionId,
    conversationMessages,
    isStreaming,
    partialMessage,
    handleSend,
    handleCancel,
    previewAttachment,
    closeAttachment,
  };
}
