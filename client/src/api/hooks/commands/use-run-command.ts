import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { CommandSpec } from "@/api/types";
import { useProjectKeys } from "../_shared";

/**
 * Blocking command execution. Returns the full result (or an error
 * shape with `{ code, message, hint }`) once the subprocess exits.
 * Use `useCommandStream` when you need live output.
 */
export function useRunCommand() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (spec: CommandSpec) => api.commands.run(spec),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.commandRuns() });
    },
  });
}

export function useCancelCommand() {
  return useMutation({
    mutationFn: (runId: string) => api.commands.cancel(runId),
  });
}
