import { useEffect, useCallback } from "react";
import {
  useGlobalSettingsQuery,
  useUpdateGlobalSettings,
} from "@/api/hooks/settings";

type ThemeMode = "light" | "dark";
type ThemeSetting = "light" | "dark" | "system";

function resolveMode(setting: ThemeSetting): ThemeMode {
  if (setting === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return setting;
}

function applyMode(mode: ThemeMode) {
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Apply dark mode before first paint based on localStorage fallback
// (settings query hasn't resolved yet on initial load)
const initialFallback = localStorage.getItem(
  "studio-theme-mode",
) as ThemeMode | null;
applyMode(
  initialFallback ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"),
);

/**
 * Single source of truth for theme mode.
 * Uses global (app-level) settings so theme is consistent across all pages.
 */
export function useThemeMode() {
  const { data: settings } = useGlobalSettingsQuery();
  const updateMutation = useUpdateGlobalSettings();

  const themeSetting = (settings?.["appearance.theme"] ??
    "system") as ThemeSetting;
  const mode = resolveMode(themeSetting);

  // Apply whenever the resolved mode changes
  useEffect(() => {
    applyMode(mode);
    localStorage.setItem("studio-theme-mode", mode);
  }, [mode]);

  // Listen for system preference changes when set to 'system'
  useEffect(() => {
    if (themeSetting !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode(resolveMode("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeSetting]);

  const setTheme = useCallback(
    (value: ThemeSetting) => {
      updateMutation.mutate({ "appearance.theme": value });
    },
    [updateMutation],
  );

  const toggle = useCallback(() => {
    setTheme(mode === "dark" ? "light" : "dark");
  }, [mode, setTheme]);

  return { mode, themeSetting, toggle, setTheme };
}
