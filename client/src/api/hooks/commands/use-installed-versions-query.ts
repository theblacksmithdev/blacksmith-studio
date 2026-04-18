import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

/**
 * Enumerate interpreters the backend toolchain found on this machine
 * (pyenv versions, conda envs, Homebrew, system Python, …). Used by
 * the env inspector to offer a "Change interpreter" picker.
 */
export function useInstalledVersionsQuery(toolchainId: string | undefined) {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: toolchainId
      ? keys.commandInstalledVersions(toolchainId)
      : (["commandInstalledVersions", "disabled"] as const),
    queryFn: () => api.commands.listInstalledVersions(toolchainId!),
    enabled: !!toolchainId,
    staleTime: 30_000,
  });
}
