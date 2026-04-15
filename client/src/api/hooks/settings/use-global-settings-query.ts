import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Fetches all global settings (not project-scoped).
 */
export function useGlobalSettingsQuery() {
  return useQuery({
    queryKey: ["settings", "global"] as const,
    queryFn: () => api.settings.getAllGlobal(),
  });
}
