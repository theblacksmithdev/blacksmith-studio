import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Fetches buffered runner logs. Optionally filtered by configId.
 */
export function useRunnerLogsQuery(configId?: string) {
  return useQuery({
    queryKey: ["runner", "logs", configId] as const,
    queryFn: () => api.runner.getLogs(configId),
  });
}
