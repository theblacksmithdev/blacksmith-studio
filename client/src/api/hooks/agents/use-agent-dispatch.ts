import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { AttachmentRecord } from "@/api/modules/attachments";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Dispatches a prompt via the PM-first agent flow.
 * Invalidates conversations and chat on success.
 */
export function useAgentDispatch() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: ({
      prompt,
      conversationId,
      attachments,
    }: {
      prompt: string;
      conversationId?: string;
      attachments?: AttachmentRecord[];
    }) =>
      api.multiAgents.dispatch(projectId!, prompt, conversationId, attachments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.agentConversations });
    },
  });
}
