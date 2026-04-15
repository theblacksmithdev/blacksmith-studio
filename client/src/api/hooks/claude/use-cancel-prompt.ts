import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Cancels an in-progress AI prompt by session ID.
 */
export function useCancelPrompt() {
  return useMutation({
    mutationFn: (sessionId: string) => api.claude.cancel({ sessionId }),
  });
}
