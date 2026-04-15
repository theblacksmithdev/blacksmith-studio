import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the list of knowledge documents for the active project.
 */
export function useKnowledgeListQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.knowledge,
    queryFn: () => api.knowledge.list(projectId!),
    enabled: !!projectId,
  });
}
