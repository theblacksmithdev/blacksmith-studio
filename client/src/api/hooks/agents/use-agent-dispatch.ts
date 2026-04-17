import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Dispatches a prompt via the PM-first agent flow.
 * Invalidates conversations and chat on success.
 */
export function useAgentDispatch() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({
      prompt,
      conversationId,
    }: {
      prompt: string;
      conversationId?: string;
    }) => api.multiAgents.dispatch(projectId!, prompt, conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentConversations });
    },
  });
}
