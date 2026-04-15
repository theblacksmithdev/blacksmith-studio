import { useEffect, useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useUiStore } from "@/stores/ui-store";

/**
 * Single source of truth for sidebar expanded/collapsed state.
 * Reads initial value from settings, syncs runtime state to Zustand for fast UI updates.
 * Persists changes back to settings.
 */
export function useSidebar() {
  const { data: settings } = useSettingsQuery();
  const updateMutation = useUpdateSettings();
  const expanded = useUiStore((s) => s.sidebarExpanded);

  // Sync initial value from settings on mount
  useEffect(() => {
    if (settings) {
      const collapsed = (settings["appearance.sidebarCollapsed"] ??
        false) as boolean;
      useUiStore.getState().setSidebarExpanded(!collapsed);
    }
  }, [settings?.["appearance.sidebarCollapsed"]]);

  const setExpanded = useCallback(
    (value: boolean) => {
      useUiStore.getState().setSidebarExpanded(value);
      updateMutation.mutate({ "appearance.sidebarCollapsed": !value });
    },
    [updateMutation],
  );

  const toggle = useCallback(() => {
    const next = !useUiStore.getState().sidebarExpanded;
    useUiStore.getState().setSidebarExpanded(next);
    updateMutation.mutate({ "appearance.sidebarCollapsed": !next });
  }, [updateMutation]);

  return { expanded, setExpanded, toggle };
}
