import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

export function useSetupVenv() {
  const qc = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: () => api.python.setupVenv(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.pythonCheck });
    },
  });
}
