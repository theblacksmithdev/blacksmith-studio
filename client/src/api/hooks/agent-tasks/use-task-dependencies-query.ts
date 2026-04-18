import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/** Dependency edges for every task in a dispatch (the task DAG). */
export function useTaskDependenciesQuery(dispatchId: string | undefined) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: dispatchId
      ? keys.taskDependencies(dispatchId)
      : (["taskDependencies", "disabled"] as const),
    queryFn: () => api.agentTasks.listDependencies(dispatchId!),
    enabled: !!dispatchId,
  });
}
