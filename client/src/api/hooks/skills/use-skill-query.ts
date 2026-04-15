import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches a single skill by name.
 */
export function useSkillQuery(name: string | undefined) {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: [...keys.skills, name] as const,
    queryFn: () => api.skills.get(projectId!, name!),
    enabled: !!projectId && !!name,
  });
}
