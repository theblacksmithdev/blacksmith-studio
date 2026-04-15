import { useUiStore } from "@/stores/ui-store";

/**
 * Portable hook for the terminal panel open state.
 * Returns a [isOpen, toggle] tuple — use it like useState.
 *
 * @example
 * const [isOpen, toggle] = useTerminalPanel();
 */
export function useTerminalPanel(): [boolean, () => void] {
  const isOpen = useUiStore((s) => s.terminalOpen);
  const toggle = useUiStore((s) => s.toggleTerminal);
  return [isOpen, toggle];
}
