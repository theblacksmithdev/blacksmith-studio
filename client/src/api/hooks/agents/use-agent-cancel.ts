import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type { AgentRole } from "@/api/types";

/**
 * Cancels a running agent by role.
 */
export function useAgentCancel() {
  return useMutation({
    mutationFn: (role: AgentRole) => api.multiAgents.cancel(role),
  });
}
