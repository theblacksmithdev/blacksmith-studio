import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ConversationEvent } from "@/api/types";
import { useProjectKeys } from "../_shared";

/**
 * Keeps the `agentTasks(dispatchId)` query fresh by watching the
 * unified conversation-events append stream for task-shaped events
 * (`task_status_change`, `task_result`, `task_created`).
 *
 * Invalidation-only (not surgical patching): the tasks query is cheap
 * and this avoids a second source of truth for task state.
 */
export function useAgentTasksSubscription(
  dispatchId: string | undefined,
): void {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  useEffect(() => {
    if (!dispatchId) return;

    const unsubscribe = api.conversationEvents.onAppend(
      (event: ConversationEvent) => {
        if (event.dispatchId !== dispatchId) return;
        const taskEvents = new Set([
          "task_status_change",
          "task_result",
          "task_created",
        ]);
        if (!taskEvents.has(event.eventType)) return;
        queryClient.invalidateQueries({ queryKey: keys.agentTasks(dispatchId) });
        if (event.taskId) {
          queryClient.invalidateQueries({
            queryKey: keys.agentTask(event.taskId),
          });
        }
      },
    );
    return unsubscribe;
  }, [queryClient, keys, dispatchId]);
}
