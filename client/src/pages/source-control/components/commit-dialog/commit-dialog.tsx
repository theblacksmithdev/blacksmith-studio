import { GitCommitHorizontal } from "lucide-react";
import {
  Modal,
  ModalFooterSpacer,
  Button,
  Badge,
  SkeletonList,
} from "@/components/shared/ui";
import { useCommit } from "./hooks";
import { MessageInput, FileList } from "./components";

interface CommitDialogProps {
  onClose: () => void;
  onCommitted: () => void;
}

export function CommitDialog({ onClose, onCommitted }: CommitDialogProps) {
  const {
    files,
    total,
    selectedCount,
    isFileSelected,
    isAllSelected,
    isLoadingFiles,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    message,
    setMessage,
    toggleFile,
    toggleAll,
    handleCommit,
    regenerateMessage,
    isCommitting,
    isGenerating,
    canCommit,
  } = useCommit(onCommitted);

  return (
    <Modal
      title="Commit Changes"
      onClose={onClose}
      width="520px"
      headerExtra={
        total > 0 ? (
          <Badge variant="default" size="sm">
            {total} file{total !== 1 ? "s" : ""}
          </Badge>
        ) : undefined
      }
      footer={
        <>
          <ModalFooterSpacer />
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleCommit}
            disabled={!canCommit}
          >
            <GitCommitHorizontal size={14} />
            {isCommitting ? "Committing..." : "Commit"}
          </Button>
        </>
      }
    >
      <MessageInput
        value={message}
        onChange={setMessage}
        onRegenerate={regenerateMessage}
        isGenerating={isGenerating}
      />

      {isLoadingFiles ? (
        <SkeletonList rows={5} />
      ) : (
        <FileList
          files={files}
          total={total}
          selectedCount={selectedCount}
          isAllSelected={isAllSelected}
          isFileSelected={isFileSelected}
          onToggle={toggleFile}
          onToggleAll={toggleAll}
          onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
          isLoadingMore={isFetchingNextPage}
        />
      )}
    </Modal>
  );
}
