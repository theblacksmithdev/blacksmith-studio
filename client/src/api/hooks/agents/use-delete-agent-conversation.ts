import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Deletes an agent conversation. Invalidates conversations list on success.
 */
export function useDeleteAgentConversation() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (conversationId: string) =>
      api.agents.deleteConversation(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentConversations });
    },
  });
}
