import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId } from "../_shared";

/**
 * Starts a runner service. Pass configId for a single service, omit for all.
 */
export function useStartRunner() {
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (configId?: string) => api.runner.start(projectId!, configId),
  });
}
