import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/** Starts a model download. Progress lands via `onPullProgress`. */
export function usePullModelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.ollama.pullModel(name),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ollamaModels });
    },
  });
}
