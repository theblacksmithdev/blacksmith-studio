import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Cancels all running agents.
 */
export function useAgentCancelAll() {
  return useMutation({
    mutationFn: () => api.agents.cancelAll(),
  });
}
