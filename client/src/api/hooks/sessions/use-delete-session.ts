import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Deletes a session by ID.
 * Invalidates the sessions list on success.
 */
export function useDeleteSession() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (id: string) => api.sessions.delete({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sessions });
    },
  });
}
