import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Fetches the list of skills for the active project.
 */
export function useSkillsListQuery() {
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useQuery({
    queryKey: keys.skills,
    queryFn: () => api.skills.list(projectId!),
    enabled: !!projectId,
  });
}
