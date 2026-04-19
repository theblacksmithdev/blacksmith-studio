import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys, useActiveProjectId, useChannel } from "../_shared";

/**
 * Handles the full Graphify setup flow: install into venv + stream progress logs.
 * Uses useChannel for progress streaming. Invalidates check + status queries on success.
 */
export function useGraphifySetup() {
  const qc = useQueryClient();
  const keys = useProjectKeys();
  const projectId = useActiveProjectId();
  const progress = useChannel("graphify:buildProgress");

  const mutation = useMutation({
    mutationFn: () => {
      progress.clear();
      return api.graphify.setup(projectId ?? undefined);
    },
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: keys.graphifyCheck });
        qc.invalidateQueries({ queryKey: keys.graphifyStatus });
      }
    },
  });

  return {
    setup: mutation.mutate,
    isPending: mutation.isPending,
    logs: progress.messages.map((m) => m.line),
    result: mutation.data ?? null,
    error:
      mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
          ? String(mutation.error)
          : null,
    reset: () => {
      mutation.reset();
      progress.clear();
    },
  };
}
