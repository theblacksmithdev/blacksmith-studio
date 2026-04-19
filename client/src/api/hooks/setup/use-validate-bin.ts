import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Validates a user-selected binary path by running its `--version` and
 * returning the parsed output. Used by the onboarding binary picker to
 * check a "Browse…" pick before it's accepted.
 */
export function useValidateBin() {
  return useMutation({
    mutationFn: (path: string) => api.setup.validateBin(path),
  });
}
