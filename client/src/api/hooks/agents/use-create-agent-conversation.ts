import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Creates a new agent conversation. Invalidates conversations list on success.
 */
export function useCreateAgentConversation() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (title?: string) =>
      api.multiAgents.createConversation(projectId!, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentConversations });
    },
  });
}
