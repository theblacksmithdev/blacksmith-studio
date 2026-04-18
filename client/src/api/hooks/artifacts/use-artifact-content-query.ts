import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Reads the artifact's file content from disk via the backend. The
 * result is cached per artifact id; writes invalidate the cache.
 */
export function useArtifactContentQuery(id: string | undefined) {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: id
      ? keys.artifactContent(id)
      : (["artifactContent", "disabled"] as const),
    queryFn: () => api.artifacts.readContent(id!),
    enabled: !!id,
  });
}
