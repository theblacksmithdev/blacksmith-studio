import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { useSidebar } from "@/hooks/use-sidebar";

const MIN_FONT = 12;
const MAX_FONT = 20;

export { MIN_FONT, MAX_FONT };

export function useAppearanceSettings() {
  const { data: settings = {} } = useSettingsQuery();
  const updateMutation = useUpdateSettings();
  const { themeSetting, setTheme } = useThemeMode();
  const { expanded: sidebarExpanded, setExpanded: setSidebarExpanded } =
    useSidebar();

  const fontSize = (settings["appearance.fontSize"] ?? 14) as number;

  const setFontSize = useCallback(
    (delta: number) => {
      const next = Math.max(MIN_FONT, Math.min(MAX_FONT, fontSize + delta));
      updateMutation.mutate({ "appearance.fontSize": next });
      const zoomLevel = (next - 14) * 0.5;
      window.electronAPI?.setZoomLevel(zoomLevel);
      localStorage.setItem("studio-zoom-level", String(zoomLevel));
    },
    [updateMutation, fontSize],
  );

  return {
    theme: themeSetting,
    fontSize,
    sidebarCollapsed: !sidebarExpanded,
    setTheme,
    setFontSize,
    setSidebarCollapsed: (collapsed: boolean) => setSidebarExpanded(!collapsed),
  };
}
