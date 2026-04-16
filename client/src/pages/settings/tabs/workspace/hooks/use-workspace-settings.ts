import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettings } from "@/api/hooks/settings";

const DEFAULTS: Record<string, string> = {
  "project.displayName": "",
  "project.ignoredPatterns": `node_modules,
.git,
__pycache__,
venv,
dist,
.env,
.blacksmith-studio
`,
  "runner.nodePath": "",
  "python.pythonPath": "",
};

export function useWorkspaceSettings() {
  const { data: settings = {} } = useSettingsQuery();
  const updateMutation = useUpdateSettings();

  const set = useCallback(
    (key: string, value: any) => updateMutation.mutate({ [key]: value }),
    [updateMutation],
  );

  const resetAll = useCallback(() => {
    updateMutation.mutate(DEFAULTS);
  }, [updateMutation]);

  return {
    displayName: (settings["project.displayName"] ?? "") as string,
    ignoredPatterns: (settings["project.ignoredPatterns"] ?? "") as string,
    nodePath: (settings["runner.nodePath"] ?? "") as string,
    pythonPath: (settings["python.pythonPath"] ?? "") as string,

    setDisplayName: (v: string | number) => set("project.displayName", v),
    setIgnoredPatterns: (v: string) => set("project.ignoredPatterns", v),
    setNodePath: (v: string) => set("runner.nodePath", v),
    setPythonPath: (v: string) => set("python.pythonPath", v),
    resetAll,
  };
}
