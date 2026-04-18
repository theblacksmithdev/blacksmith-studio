import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/** Agent-authored breadcrumbs attached to a task. */
export function useTaskNotesQuery(taskId: string | undefined) {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: taskId
      ? keys.taskNotes(taskId)
      : (["taskNotes", "disabled"] as const),
    queryFn: () => api.agentTasks.listNotes(taskId!),
    enabled: !!taskId,
  });
}
