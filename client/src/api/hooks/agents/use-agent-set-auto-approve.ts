import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Enables or disables auto-approve for build input requests.
 */
export function useAgentSetAutoApprove() {
  return useMutation({
    mutationFn: (enabled: boolean) => api.multiAgents.setAutoApprove(enabled),
  });
}
