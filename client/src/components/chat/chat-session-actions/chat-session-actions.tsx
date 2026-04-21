import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, MessageSquarePlus } from "lucide-react";
import { IconButton, Tooltip } from "@/components/shared/ui";
import { useAiChat } from "@/hooks/use-ai-chat";
import { useCreateSession } from "@/api/hooks/sessions";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { chatPath } from "@/router/paths";

interface ChatSessionActionsProps {
  sessionId: string | null | undefined;
  isStreaming: boolean;
}

/**
 * Compact + Clear actions for the current chat session.
 *
 * - **Compact**: pipes Claude's native `/compact` through the existing
 *   sendPrompt path. The CLI handles summarization; the context meter
 *   drops on the next turn.
 * - **Clear**: creates a fresh session and navigates to it. Prior
 *   history stays in the side panel (no hard delete).
 *
 * Both paths consume hooks — no direct `api.*` calls — so caching and
 * query invalidation stay in React Query.
 */
export function ChatSessionActions({
  sessionId,
  isStreaming,
}: ChatSessionActionsProps) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { sendPrompt } = useAiChat();
  const createSession = useCreateSession();

  const handleCompact = useCallback(() => {
    if (!sessionId || isStreaming) return;
    sendPrompt("/compact", sessionId);
  }, [sessionId, isStreaming, sendPrompt]);

  const handleClear = useCallback(() => {
    if (!projectId) return;
    createSession.mutate(undefined, {
      onSuccess: (session) => navigate(chatPath(projectId, session.id)),
    });
  }, [projectId, createSession, navigate]);

  const compactDisabled = !sessionId || isStreaming;
  const clearDisabled = !projectId || createSession.isPending;

  return (
    <>
      <Tooltip
        content={
          isStreaming
            ? "Finish the current turn before compacting"
            : "Compact context (runs /compact)"
        }
      >
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleCompact}
          disabled={compactDisabled}
          aria-label="Compact context"
        >
          <Archive />
        </IconButton>
      </Tooltip>
      <Tooltip content="Start a new chat (clears current context)">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={clearDisabled}
          aria-label="Start new chat"
        >
          <MessageSquarePlus />
        </IconButton>
      </Tooltip>
    </>
  );
}
