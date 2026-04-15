import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the content of a single knowledge document by name.
 */
export function useKnowledgeQuery(name: string | undefined) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: [...keys.knowledge, name] as const,
    queryFn: () => api.knowledge.get(projectId!, name!),
    enabled: !!projectId && !!name,
  });
}
