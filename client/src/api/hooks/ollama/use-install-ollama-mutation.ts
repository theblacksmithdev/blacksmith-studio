import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/** Kicks off the download + extract flow. Progress lands via `onInstallProgress`. */
export function useInstallOllamaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.ollama.install(),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ollamaState });
      qc.invalidateQueries({ queryKey: queryKeys.aiProviders });
    },
  });
}
