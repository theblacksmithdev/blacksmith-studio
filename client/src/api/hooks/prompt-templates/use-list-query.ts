import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Fetches the list of available prompt templates.
 */
export function usePromptTemplatesQuery() {
  const keys = useProjectKeys();

  return useQuery({
    queryKey: keys.templates,
    queryFn: () => api.templates.list(),
  });
}
