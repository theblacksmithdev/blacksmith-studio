import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { AgentTask } from "@/api/types";
import { useProjectKeys } from "../_shared";

/** Tasks belonging to a dispatch, ordered by orderIndex. */
export function useAgentTasksQuery(dispatchId: string | undefined) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: dispatchId
      ? keys.agentTasks(dispatchId)
      : (["agentTasks", "disabled"] as const),
    queryFn: () => api.agentTasks.list(dispatchId!) as Promise<AgentTask[]>,
    enabled: !!dispatchId,
  });
}
