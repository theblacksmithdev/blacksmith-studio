import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { Onboarding } from "@/components/setup/onboarding";
import { useGlobalSettingsQuery } from "@/api/hooks/settings";

// Restore zoom level on startup
const savedZoom = localStorage.getItem("studio-zoom-level");
if (savedZoom) {
  const level = parseFloat(savedZoom);
  if (!isNaN(level)) window.electronAPI?.setZoomLevel(level);
}

/**
 * Gate the main app behind the first-use onboarding flow. The flag
 * lives in global SQLite settings (`onboarding.completed`) read via
 * `useGlobalSettingsQuery` so every consumer shares the same cache.
 */
export function App() {
  const globalSettings = useGlobalSettingsQuery();

  // While the query hasn't resolved, render nothing — flashing the
  // onboarding and then hiding it is jarring.
  if (globalSettings.isLoading) return null;

  // If we can't read settings at all (DB not ready, IPC error), default
  // to letting users in rather than blocking them behind onboarding.
  const completed =
    globalSettings.isError || !!globalSettings.data?.["onboarding.completed"];

  if (!completed) {
    return (
      <Onboarding
        onComplete={() => {
          globalSettings.refetch();
        }}
      />
    );
  }

  return <RouterProvider router={router} />;
}
