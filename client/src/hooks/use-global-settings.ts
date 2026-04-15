import {
  useGlobalSettingsQuery,
  useUpdateGlobalSettings,
} from "@/api/hooks/settings";

/**
 * Global app-level settings — no active project required.
 * Project-level settings always override these when both exist.
 */
export function useGlobalSettings() {
  const { data: settings = {} } = useGlobalSettingsQuery();
  const updateMutation = useUpdateGlobalSettings();

  const get = (key: string): any => settings[key] ?? null;
  const set = (key: string, value: any) =>
    updateMutation.mutate({ [key]: value });

  return {
    get,
    set,
    nodePath: (settings["runner.nodePath"] as string) ?? "",
  };
}
