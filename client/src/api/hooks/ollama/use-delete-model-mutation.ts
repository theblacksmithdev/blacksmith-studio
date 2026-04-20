import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/** Removes a model from disk. */
export function useDeleteModelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.ollama.deleteModel(name),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ollamaModels });
    },
  });
}
