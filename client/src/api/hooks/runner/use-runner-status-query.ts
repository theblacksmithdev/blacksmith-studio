import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Fetches the current status of all runner services.
 */
export function useRunnerStatusQuery() {
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: ["runner", projectId, "status"] as const,
    queryFn: () => api.runner.getStatus(projectId!),
    enabled: !!projectId,
  });
}
