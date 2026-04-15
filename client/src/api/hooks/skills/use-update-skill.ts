import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Updates an existing skill. Invalidates the skills list on success.
 */
export function useUpdateSkill() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      content: string;
    }) => api.skills.update(projectId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.skills });
    },
  });
}
