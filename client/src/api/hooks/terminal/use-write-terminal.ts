import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Writes data to a terminal by its ID.
 */
export function useWriteTerminal() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: string }) =>
      api.terminal.write(id, data),
  });
}
