import { useEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

/**
 * Mount the Ctrl+` / Cmd+` shortcut for toggling the terminal panel.
 * Extracted so the layout component stays about rendering, not key
 * event plumbing.
 */
export function useTerminalShortcut() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        useUiStore.getState().toggleTerminal();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
