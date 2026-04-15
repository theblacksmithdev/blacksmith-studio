import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import { useAgentStore } from "@/stores/agent-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { agentsConversationPath } from "@/router/paths";

export function useConversation(conversationId: string | undefined) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const addChatMessage = useAgentStore((s) => s.addChatMessage);
  const loadPersistedChat = useAgentStore((s) => s.loadPersistedChat);
  const clearChat = useAgentStore((s) => s.clearChat);

  const [currentConvId, setCurrentConvId] = useState<string | undefined>(
    conversationId,
  );

  // Load persisted chat for this conversation
  useEffect(() => {
    clearChat();
    if (currentConvId && projectId) {
      api.agents
        .listChat(projectId, currentConvId)
        .then((messages) => {
          if (messages.length > 0) {
            loadPersistedChat(
              messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                agentRole: m.agentRole,
                content: m.content,
                timestamp: m.timestamp,
              })),
            );
          }
        })
        .catch(() => {});
    }
  }, [currentConvId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (message: string) => {
      addChatMessage({ role: "user", content: message });

      let convId = currentConvId;

      // Create conversation on first message if we're on /agents/new
      if (!convId) {
        try {
          const conv = await api.agents.createConversation(
            projectId!,
            message.slice(0, 60),
          );
          convId = conv.id as string;
          setCurrentConvId(convId);
          if (projectId && convId) {
            navigate(agentsConversationPath(projectId, convId), {
              replace: true,
            });
          }
        } catch (err: any) {
          addChatMessage({
            role: "system",
            content: `Failed to create conversation: ${err.message}`,
          });
          return;
        }
      }

      try {
        const result = await api.agents.dispatch(projectId!, message, convId);
        const totalCost = result.executions.reduce(
          (sum: number, e: any) => sum + e.costUsd,
          0,
        );
        if (totalCost > 0) {
          addChatMessage({
            role: "system",
            content: `All tasks finished — total $${totalCost.toFixed(4)}`,
          });
        }
      } catch (err: any) {
        addChatMessage({ role: "system", content: `Error: ${err.message}` });
      }
    },
    [addChatMessage, currentConvId, projectId, navigate],
  );

  return { currentConvId, handleSend };
}
