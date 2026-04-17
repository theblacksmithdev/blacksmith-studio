import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the list of agent conversations for the active project.
 */
export function useAgentConversationsQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.agentConversations,
    queryFn: () => api.multiAgents.listConversations(projectId!),
    enabled: !!projectId,
  });
}
