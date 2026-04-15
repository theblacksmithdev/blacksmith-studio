import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAgentConversation } from "@/api/hooks/agents";
import { useAgentStore } from "@/stores/agent-store";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { agentsConversationPath } from "@/router/paths";

/**
 * Handles the /agents/new flow: creates a conversation then navigates to it.
 * The initial message is passed via route state so useConversation dispatches
 * it on arrival — same code path as any subsequent message.
 */
export function useNewConversation() {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const addLiveMessage = useAgentStore((s) => s.addLiveMessage);
  const createConversation = useCreateAgentConversation();

  const handleSend = useCallback(
    (message: string) => {
      createConversation.mutate(message.slice(0, 60), {
        onSuccess: (conv) => {
          navigate(agentsConversationPath(projectId!, conv.id as string), {
            replace: true,
            state: { initialPrompt: message },
          });
        },
        onError: (err: any) => {
          addLiveMessage({
            role: "system",
            content: `Failed to start conversation: ${err.message}`,
          });
        },
      });
    },
    [projectId, addLiveMessage, createConversation, navigate],
  );

  return { handleSend };
}
