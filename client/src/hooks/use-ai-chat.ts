import { useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";
import { useChannelEffect } from "@/api/hooks/_shared";
import { useSendPrompt, useCancelPrompt } from "@/api/hooks/claude";
import type { AttachmentRecord } from "@/components/shared/conversation";

export function useAiChat() {
  const lastContentRef = useRef("");
  const currentSessionRef = useRef<string | null>(null);
  const chatStore = useChatStore;
  const markChanged = useFileStore((s) => s.markChanged);
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const sendMutation = useSendPrompt();
  const cancelMutation = useCancelPrompt();

  useChannelEffect("singleAgent:message", (data) => {
    lastContentRef.current = data.content;
    chatStore.getState().updateStreamingMessage(data.content);
  });

  useChannelEffect("singleAgent:toolUse", (data) => {
    chatStore.getState().addToolCall({
      toolId: data.toolId,
      toolName: data.toolName,
      input: data.input,
    });
  });

  useChannelEffect("singleAgent:done", () => {
    chatStore.getState().appendPendingAssistantMessage(lastContentRef.current);
    lastContentRef.current = "";
    const sid = currentSessionRef.current;
    if (sid && projectId) {
      qc.invalidateQueries({
        queryKey: queryKeys.forProject(projectId).session(sid),
      });
    }
  });

  useChannelEffect("singleAgent:error", (data) => {
    chatStore.getState().appendPendingAssistantMessage(`Error: ${data.error}`);
    lastContentRef.current = "";
  });

  useChannelEffect("files:changed", (data) => {
    markChanged(data.paths);
  });

  const sendPrompt = useCallback(
    (
      prompt: string,
      sessionId: string,
      attachments?: AttachmentRecord[],
    ) => {
      const store = chatStore.getState();
      currentSessionRef.current = sessionId;
      store.addPendingUserMessage(prompt, attachments);
      store.setStreaming(true);
      store.updateStreamingMessage("");
      lastContentRef.current = "";
      sendMutation.mutate({ sessionId, prompt, attachments });
    },
    [chatStore, sendMutation],
  );

  const cancelPrompt = useCallback(
    (sessionId: string) => {
      cancelMutation.mutate(sessionId);
      chatStore.getState().setStreaming(false);
    },
    [chatStore, cancelMutation],
  );

  return { sendPrompt, cancelPrompt };
}
