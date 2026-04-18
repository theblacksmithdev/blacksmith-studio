import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

export function useCommandRunsQuery(input?: {
  conversationId?: string;
  limit?: number;
}) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();
  return useQuery({
    queryKey: keys.commandRuns(input?.conversationId),
    queryFn: () =>
      api.commands.listRuns({
        projectId: projectId!,
        conversationId: input?.conversationId,
        limit: input?.limit,
      }),
    enabled: !!projectId,
  });
}

export function useCommandRunQuery(runId: string | undefined) {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: runId
      ? keys.commandRun(runId)
      : (["commandRun", "disabled"] as const),
    queryFn: () => api.commands.getRun(runId!),
    enabled: !!runId,
  });
}
