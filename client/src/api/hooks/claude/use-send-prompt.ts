import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Sends a prompt to AI for a given session.
 * Results are streamed back via subscription channels (onMessage, onDone, etc).
 */
export function useSendPrompt() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({
      sessionId,
      prompt,
    }: {
      sessionId: string;
      prompt: string;
    }) => api.claude.sendPrompt({ projectId: projectId!, sessionId, prompt }),
  });
}
