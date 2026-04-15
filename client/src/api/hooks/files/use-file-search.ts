import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Searches file contents in the active project.
 * Only runs when a non-empty query is provided.
 */
export function useFileSearch(query: string, maxResults?: number) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: [...keys.files, "search", query, maxResults] as const,
    queryFn: () => api.files.search(projectId!, query, maxResults),
    enabled: !!projectId && query.length > 0,
  });
}
