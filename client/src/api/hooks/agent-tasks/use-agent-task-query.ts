import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/** Single task lookup; returns null when the id is unknown. */
export function useAgentTaskQuery(taskId: string | undefined) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: taskId
      ? keys.agentTask(taskId)
      : (["agentTask", "disabled"] as const),
    queryFn: () => api.agentTasks.get(taskId!),
    enabled: !!taskId,
  });
}
