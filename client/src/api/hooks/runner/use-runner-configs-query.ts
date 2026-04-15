import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches runner configurations for the active project.
 */
export function useRunnerConfigsQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.runnerConfigs,
    queryFn: () => api.runner.getConfigs(projectId!),
    enabled: !!projectId,
  });
}
