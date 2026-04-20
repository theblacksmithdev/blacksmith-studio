import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { queryKeys } from "@/api/query-keys";

/** Installed models — driven by `ollama:listModels`. */
export function useOllamaModelsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.ollamaModels,
    queryFn: () => api.ollama.listModels(),
    enabled,
  });
}
