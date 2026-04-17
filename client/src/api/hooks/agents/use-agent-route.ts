import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Routes a prompt to determine which agent should handle it.
 */
export function useAgentRoute() {
  return useMutation({
    mutationFn: (prompt: string) => api.multiAgents.route(prompt),
  });
}
