import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";
import type { SessionRenameInput } from "@/api/types";

/**
 * Renames an existing session.
 * Invalidates both the sessions list and the individual session cache.
 */
export function useRenameSession() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (input: SessionRenameInput) => api.sessions.rename(input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.sessions });
      qc.invalidateQueries({ queryKey: keys.session(id) });
    },
  });
}
