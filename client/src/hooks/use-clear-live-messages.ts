import { useEffect, useCallback } from "react";
import { useAgentStore } from "@/stores/agent-store";
import { useChatStore } from "@/stores/chat-store";

export type LiveMessageScope = "agents" | "chat";

/**
 * Hook to clear live/pending messages and conversation state from the appropriate store.
 *
 * @param scope - "agents" for multi-agent chat (clears all agent state including canvas),
 *                "chat" for single-agent chat (clears only pending messages)
 * @param when - When to clear: "mount" (on mount only), "unmount" (on unmount only),
 *               "both" (default - clear on mount and when scope changes)
 */
export function useClearLiveMessages(
  scope: LiveMessageScope,
  when: "mount" | "unmount" | "both" = "both",
) {
  const clearAgentState = useAgentStore((s) => s.clearAll);
  const clearChatMessages = useChatStore((s) => s.clearPendingMessages);

  const clear = useCallback(() => {
    if (scope === "agents") {
      clearAgentState();
    } else {
      clearChatMessages();
    }
  }, [scope, clearAgentState, clearChatMessages]);

  useEffect(() => {
    if (when === "mount" || when === "both") {
      clear();
    }
    return () => {
      if (when === "unmount" || when === "both") {
        clear();
      }
    };
  }, [clear, when]);

  // Also clear when scope changes (for "both" mode)
  useEffect(() => {
    if (when === "both") {
      clear();
    }
  }, [scope, clear, when]);

  return clear;
}
