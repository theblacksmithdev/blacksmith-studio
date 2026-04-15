import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

/**
 * Resizes a terminal by its ID.
 */
export function useResizeTerminal() {
  return useMutation({
    mutationFn: ({
      id,
      cols,
      rows,
    }: {
      id: string;
      cols: number;
      rows: number;
    }) => api.terminal.resize(id, cols, rows),
  });
}
