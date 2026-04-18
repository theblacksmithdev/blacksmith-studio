import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "@/api";
import { useFileStore } from "@/stores/file-store";
import { useProjectKeys } from "@/api/hooks/_shared";
import { useSaveFile } from "@/api/hooks/files";

export function useFiles() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();
  const { openFile, setTabContent, setTabError, markSaved } = useFileStore();
  const { projectId } = useParams<{ projectId: string }>();
  const saveMutation = useSaveFile();

  const treeQuery = useQuery({
    queryKey: keys.files,
    queryFn: () => api.files.tree(projectId!),
    staleTime: 30_000,
    enabled: !!projectId,
  });

  const fetchFileContent = async (filePath: string) => {
    openFile(filePath);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: keys.fileContent(filePath),
        queryFn: () => api.files.content(projectId!, filePath),
        staleTime: Infinity,
      });
      setTabContent(filePath, data.content, data.language);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load file";
      setTabError(filePath, message);
    }
  };

  const saveFileContent = (filePath: string) => {
    const tab = useFileStore
      .getState()
      .openTabs.find((t) => t.path === filePath);
    if (!tab?.content || tab.content === tab.originalContent) return;
    saveMutation.mutate(
      { path: filePath, content: tab.content },
      {
        onSuccess: () => {
          markSaved(filePath);
          queryClient.removeQueries({ queryKey: keys.fileContent(filePath) });
        },
      },
    );
  };

  return {
    tree: treeQuery.data ?? null,
    isLoading: treeQuery.isLoading,
    fetchFileTree: () => treeQuery.refetch(),
    fetchFileContent,
    saveFileContent,
  };
}
