import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

export function useArtifactQuery(id: string | undefined) {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: id ? keys.artifact(id) : (["artifact", "disabled"] as const),
    queryFn: () => api.artifacts.get(id!),
    enabled: !!id,
  });
}
