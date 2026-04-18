import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type { AttachmentRecord } from "@/api/modules/attachments";
import { useActiveProjectId } from "../_shared";

/**
 * Sends a prompt to AI for a given session. Results stream back via
 * subscription channels (onMessage, onDone, etc).
 */
export function useSendPrompt() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({
      sessionId,
      prompt,
      attachments,
    }: {
      sessionId: string;
      prompt: string;
      attachments?: AttachmentRecord[];
    }) =>
      api.singleAgent.sendPrompt({
        projectId: projectId!,
        sessionId,
        prompt,
        attachments,
      }),
  });
}
