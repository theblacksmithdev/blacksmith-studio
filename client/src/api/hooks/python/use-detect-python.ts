import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

export function useDetectPythonQuery() {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: keys.pythonInstallations,
    queryFn: () => api.python.detect(),
    staleTime: 5 * 60_000,
  });
}
