import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateAgentConversation,
  useAgentDispatch,
} from "@/api/hooks/agents";
import { useAgentStore } from "@/stores/agent-store";
import { useActiveProjectId, useProjectKeys } from "@/api/hooks/_shared";
import { agentsConversationPath } from "@/router/paths";

export function useConversation(conversationId: string | undefined) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const qc = useQueryClient();
  const keys = useProjectKeys();

  const addLiveMessage = useAgentStore((s) => s.addLiveMessage);
  const clearLiveMessages = useAgentStore((s) => s.clearLiveMessages);
  const createConversation = useCreateAgentConversation();
  const dispatch = useAgentDispatch();

  const [currentConvId, setCurrentConvId] = useState<string | undefined>(
    conversationId,
  );

  // Clear live messages and ephemeral state when switching conversations
  useEffect(() => {
    clearLiveMessages();
  }, [currentConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (message: string) => {
      addLiveMessage({ role: "user", content: message });

      let convId = currentConvId;

      // Create conversation on first message if we're on /agents/new
      if (!convId) {
        try {
          const conv = await createConversation.mutateAsync(message.slice(0, 60));
          convId = conv.id as string;
          setCurrentConvId(convId);
          if (projectId && convId) {
            navigate(agentsConversationPath(projectId, convId), {
              replace: true,
            });
          }
        } catch (err: any) {
          addLiveMessage({
            role: "system",
            content: `Failed to create conversation: ${err.message}`,
          });
          return;
        }
      }

      try {
        const result = await dispatch.mutateAsync({
          prompt: message,
          conversationId: convId,
        });

        const totalCost = result.executions.reduce(
          (sum: number, e: any) => sum + e.costUsd,
          0,
        );
        if (totalCost > 0) {
          addLiveMessage({
            role: "system",
            content: `All tasks finished — total $${totalCost.toFixed(4)}`,
          });
        }

        // Bring RQ cache up to date with the new persisted messages, then
        // discard the optimistic live messages since RQ is now the source of truth
        await qc.invalidateQueries({
          queryKey: keys.agentChat(convId!),
        });
        clearLiveMessages();
      } catch (err: any) {
        addLiveMessage({ role: "system", content: `Error: ${err.message}` });
      }
    },
    [addLiveMessage, clearLiveMessages, currentConvId, projectId, navigate, createConversation, dispatch, qc, keys],
  );

  return { currentConvId, handleSend };
}
