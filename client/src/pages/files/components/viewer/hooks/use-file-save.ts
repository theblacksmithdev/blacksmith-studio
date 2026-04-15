import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "@/api";
import { useFileStore } from "@/stores/file-store";
import { useProjectKeys } from "@/api/hooks/_shared";

interface SaveInput {
  path: string;
  content: string;
}

export function useFileSave() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const markSaved = useFileStore((s) => s.markSaved);
  const { projectId } = useParams<{ projectId: string }>();

  const mutation = useMutation({
    mutationFn: ({ path, content }: SaveInput) =>
      api.files.save(projectId!, path, content),
    onSuccess: (_data, { path }) => {
      markSaved(path);
      queryClient.removeQueries({ queryKey: keys.fileContent(path) });
    },
  });

  const save = (path: string) => {
    const tab = useFileStore.getState().openTabs.find((t) => t.path === path);
    if (!tab?.content || tab.content === tab.originalContent) return;
    mutation.mutate({ path, content: tab.content });
  };

  return {
    save,
    isSaving: mutation.isPending,
  };
}
