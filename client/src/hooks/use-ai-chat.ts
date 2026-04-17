import { useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/chat-store";
import { useFileStore } from "@/stores/file-store";

export function useAiChat() {
  const lastContentRef = useRef("");
  const currentSessionRef = useRef<string | null>(null);
  const chatStore = useChatStore;
  const markChanged = useFileStore((s) => s.markChanged);
  const { projectId } = useParams<{ projectId: string }>();
  const projectIdRef = useRef(projectId);
  const qc = useQueryClient();

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    const unsubs = [
      api.singleAgent.onMessage((data) => {
        lastContentRef.current = data.content;
        chatStore.getState().updateStreamingMessage(data.content);
      }),
      api.singleAgent.onToolUse((data) => {
        chatStore.getState().addToolCall({
          toolId: data.toolId,
          toolName: data.toolName,
          input: data.input,
        });
      }),
      api.singleAgent.onDone(() => {
        chatStore
          .getState()
          .appendPendingAssistantMessage(lastContentRef.current);
        lastContentRef.current = "";
        const sid = currentSessionRef.current;
        const pid = projectIdRef.current;
        if (sid && pid) {
          qc.invalidateQueries({
            queryKey: queryKeys.forProject(pid).session(sid),
          });
        }
      }),
      api.singleAgent.onError((data) => {
        chatStore
          .getState()
          .appendPendingAssistantMessage(`Error: ${data.error}`);
        lastContentRef.current = "";
      }),
      api.files.onChanged((data) => {
        markChanged(data.paths);
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [markChanged, qc]);

  const sendPrompt = useCallback(
    (prompt: string, sessionId: string) => {
      const store = chatStore.getState();
      currentSessionRef.current = sessionId;
      store.addPendingUserMessage(prompt);
      store.setStreaming(true);
      store.updateStreamingMessage("");
      lastContentRef.current = "";
      api.singleAgent.sendPrompt({ projectId: projectId!, sessionId, prompt });
    },
    [projectId],
  );

  const cancelPrompt = useCallback((sessionId: string) => {
    api.singleAgent.cancel({ sessionId });
    chatStore.getState().setStreaming(false);
  }, []);

  return { sendPrompt, cancelPrompt };
}
