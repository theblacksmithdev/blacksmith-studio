import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Fetches buffered runner logs. Optionally filtered by configId.
 */
export function useRunnerLogsQuery(configId?: string) {
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: ["runner", "logs", projectId, configId] as const,
    queryFn: () => api.runner.getLogs(projectId!, configId),
    enabled: !!projectId,
  });
}
