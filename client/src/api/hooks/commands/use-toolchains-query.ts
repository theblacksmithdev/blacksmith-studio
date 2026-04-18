import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

export function useToolchainsQuery() {
  const keys = useProjectKeys();
  return useQuery({
    queryKey: keys.commandToolchains,
    queryFn: () => api.commands.listToolchains(),
  });
}
