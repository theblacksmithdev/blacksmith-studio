import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useActiveProjectId, useProjectKeys } from "../_shared";

/**
 * Models the active AI provider offers for the current project.
 *
 * Re-fetched when the user changes `ai.provider` via settings —
 * `useUpdateSettings` already invalidates the project query tree, so
 * this query rides along.
 */
export function useAiModelsQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.aiModels,
    queryFn: () => api.ai.listModels(projectId!),
    enabled: !!projectId,
  });
}
