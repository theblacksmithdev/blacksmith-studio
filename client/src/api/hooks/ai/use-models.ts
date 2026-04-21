import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { ModelEntry } from "@/api/modules/ai";

/**
 * Static list of models this app can invoke. Data is effectively
 * immutable within a session, so we cache aggressively — only refetch
 * if the app reloads.
 */
export function useModels() {
  return useQuery<ModelEntry[]>({
    queryKey: ["ai", "models"] as const,
    queryFn: () => api.ai.listModels(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
