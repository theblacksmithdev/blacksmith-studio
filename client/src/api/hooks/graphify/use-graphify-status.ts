import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the Graphify graph status for the active project.
 */
export function useGraphifyStatus() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.graphifyStatus,
    queryFn: () => api.graphify.status(projectId!),
    enabled: !!projectId,
  });
}
