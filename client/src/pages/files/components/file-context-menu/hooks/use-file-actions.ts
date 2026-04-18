import { useNavigate } from "react-router-dom";
import { useFileStore } from "@/stores/file-store";
import { useProjectQuery } from "@/api/hooks/projects";
import {
  useRenameFile,
  useDeleteFile,
  useRevealFile,
  useOpenInEditor,
} from "@/api/hooks/files";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { useFiles } from "@/hooks/use-files";
import { newChatPath, agentsNewPath } from "@/router/paths";

interface UseFileActionsOptions {
  filePath: string;
  isDirectory: boolean;
  onClose: () => void;
}

function getName(filePath: string) {
  return filePath.split("/").pop() || filePath;
}

export function useFileActions({
  filePath,
  isDirectory,
  onClose,
}: UseFileActionsOptions) {
  const navigate = useNavigate();
  const projectId = useActiveProjectId();
  const { data: project } = useProjectQuery(projectId);
  const { closeTab, closeOtherTabs, closeAllTabs, renameTab } = useFileStore();
  const { fetchFileTree } = useFiles();
  const renameMutation = useRenameFile();
  const deleteMutation = useDeleteFile();
  const revealMutation = useRevealFile();
  const openInEditorMutation = useOpenInEditor();
  const fullPath = project ? `${project.path}/${filePath}` : filePath;
  const label = isDirectory ? "folder" : "file";
  const fileRef = `\`${filePath}\``;

  const run = (fn: () => void) => {
    onClose();
    fn();
  };

  const close = () => run(() => closeTab(filePath));
  const closeOthers = () => run(() => closeOtherTabs(filePath));
  const closeAll = () => run(() => closeAllTabs());

  const rename = (
    newName: string,
    onFinish?: (ok: boolean) => void,
  ): void => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === getName(filePath)) {
      onFinish?.(false);
      return;
    }
    renameMutation.mutate(
      { path: filePath, newName: trimmed },
      {
        onSuccess: ({ newPath }) => {
          if (!isDirectory) renameTab(filePath, newPath);
          fetchFileTree();
          onClose();
          onFinish?.(true);
        },
        onError: () => onFinish?.(false),
      },
    );
  };

  const deleteFile = (onFinish?: () => void): void => {
    deleteMutation.mutate(filePath, {
      onSettled: () => {
        if (!isDirectory) closeTab(filePath);
        fetchFileTree();
        onClose();
        onFinish?.();
      },
    });
  };

  const copyPath = () => run(() => navigator.clipboard.writeText(filePath));
  const copyFullPath = () => run(() => navigator.clipboard.writeText(fullPath));

  const addToChat = () => {
    if (!project) return;
    run(() =>
      navigate(newChatPath(project.id), {
        state: { initialPrompt: `Review the ${label} ${fileRef}` },
      }),
    );
  };

  const addToAgentTeam = () => {
    if (!project) return;
    run(() =>
      navigate(agentsNewPath(project.id), {
        state: { initialPrompt: `Work on the ${label} ${fileRef}` },
      }),
    );
  };

  const revealInFinder = () => run(() => revealMutation.mutate(filePath));
  const openInEditor = (command?: string) =>
    run(() => openInEditorMutation.mutate({ path: filePath, command }));

  return {
    project,
    label,
    fileName: getName(filePath),
    close,
    closeOthers,
    closeAll,
    rename,
    deleteFile,
    copyPath,
    copyFullPath,
    addToChat,
    addToAgentTeam,
    revealInFinder,
    openInEditor,
  };
}
