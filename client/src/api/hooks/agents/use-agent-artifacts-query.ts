import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Fetches artifacts (file changes) for a conversation.
 */
export function useAgentArtifactsQuery(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["agents", "artifacts", conversationId] as const,
    queryFn: () => api.agents.getArtifacts(conversationId!),
    enabled: !!conversationId,
  });
}
