import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

export function usePythonCheck() {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: keys.pythonCheck,
    queryFn: () => api.python.check(),
    staleTime: 5 * 60_000,
  });
}
