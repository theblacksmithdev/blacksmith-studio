import {
  useDetectEditorsQuery,
  useOpenInEditor,
} from "@/api/hooks/files";
import { useGlobalSettings } from "@/hooks/use-global-settings";

export function useEditors() {
  const globalSettings = useGlobalSettings();
  const { data: editors = [], isLoading } = useDetectEditorsQuery();
  const openMutation = useOpenInEditor();

  const preferredCommand = globalSettings.get("editor.preferred") as
    | string
    | null;

  const preferred =
    editors.find((e) => e.command === preferredCommand) ?? editors[0] ?? null;

  const setPreferred = (command: string) => {
    globalSettings.set("editor.preferred", command);
  };

  const openFile = (filePath: string, command?: string) => {
    const cmd = command || preferred?.command;
    if (cmd) openMutation.mutate({ path: filePath, command: cmd });
  };

  return {
    editors,
    preferred,
    isLoading,
    setPreferred,
    openFile,
  };
}
