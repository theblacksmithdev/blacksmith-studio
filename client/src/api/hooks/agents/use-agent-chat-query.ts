import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches chat messages for a specific conversation.
 * Returns no messages when conversationId is not provided (new conversation).
 */
export function useAgentChatQuery(conversationId?: string) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: conversationId
      ? keys.agentChat(conversationId)
      : ([...keys.agents, "chat"] as const),
    queryFn: () => api.agents.listChat(projectId!, conversationId),
    enabled: !!projectId && !!conversationId,
  });
}
