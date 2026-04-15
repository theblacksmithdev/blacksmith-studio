import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Removes a skill. Invalidates the skills list on success.
 */
export function useRemoveSkill() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (name: string) => api.skills.remove(projectId!, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.skills });
    },
  });
}
