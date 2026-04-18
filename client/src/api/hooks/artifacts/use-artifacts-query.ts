import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { ArtifactsListInput } from "@/api/types";
import { useProjectKeys, useActiveProjectId } from "../_shared";

type Filters = Omit<ArtifactsListInput, "projectId">;

/**
 * List artifacts for the active project, optionally filtered by
 * conversation, role, tag, or title search.
 */
export function useArtifactsQuery(filters: Filters = {}) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.artifactsFiltered(filters),
    queryFn: () => api.artifacts.list({ projectId: projectId!, ...filters }),
    enabled: !!projectId,
  });
}
