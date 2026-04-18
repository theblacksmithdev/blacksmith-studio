import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAgentDispatch } from "@/api/hooks/agents";
import { useAgentStore } from "@/stores/agent-store";
import { useProjectKeys } from "@/api/hooks/_shared";
import type { AttachmentRecord } from "@/components/shared/conversation";

/**
 * Handles sending messages within an existing conversation.
 * Clears live messages when the user switches between conversations.
 */
export function useConversation(conversationId: string) {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const addLiveMessage = useAgentStore((s) => s.addLiveMessage);
  const clearLiveMessages = useAgentStore((s) => s.clearLiveMessages);
  const dispatch = useAgentDispatch();

  // Clear stale live messages when switching between conversations
  const prevConvIdRef = useRef(conversationId);
  useEffect(() => {
    const prev = prevConvIdRef.current;
    prevConvIdRef.current = conversationId;
    if (prev !== conversationId) {
      clearLiveMessages();
    }
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    (message: string, attachments?: AttachmentRecord[]) => {
      addLiveMessage({
        role: "user",
        content: message,
        attachments:
          attachments && attachments.length > 0
            ? attachments.map((a) => ({
                id: a.id,
                name: a.name,
                kind: a.kind,
                mime: a.mime,
                size: a.size,
                absPath: a.absPath,
                relPath: a.relPath,
              }))
            : undefined,
      });

      dispatch.mutate(
        { prompt: message, conversationId, attachments },
        {
          onSuccess: async (result) => {
            const totalCost = result.executions.reduce(
              (sum: number, e: any) => sum + e.costUsd,
              0,
            );
            if (totalCost > 0) {
              addLiveMessage({
                role: "system",
                content: `Done — $${totalCost.toFixed(4)}`,
              });
            }
            await qc.invalidateQueries({
              queryKey: keys.agentChat(conversationId),
            });
            clearLiveMessages();
          },
          onError: (err: any) => {
            addLiveMessage({
              role: "system",
              content: `Error: ${err.message}`,
            });
          },
        },
      );
    },
    [conversationId, addLiveMessage, clearLiveMessages, dispatch, qc, keys],
  );

  return { handleSend };
}
