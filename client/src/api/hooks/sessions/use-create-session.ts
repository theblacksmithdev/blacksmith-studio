import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId } from "../_shared";

/**
 * Creates a new session in the active project.
 * Invalidates the sessions list on success.
 */
export function useCreateSession() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();

  return useMutation({
    mutationFn: (name?: string) =>
      api.sessions.create({ projectId: projectId!, name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sessions });
    },
  });
}
