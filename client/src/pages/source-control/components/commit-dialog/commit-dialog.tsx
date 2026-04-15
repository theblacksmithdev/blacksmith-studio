import { GitCommitHorizontal } from "lucide-react";
import {
  Modal,
  ModalFooterSpacer,
  ModalPrimaryButton,
  ModalSecondaryButton,
  SkeletonList,
} from "@/components/shared/ui";
import { useCommit } from "../../hooks";
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
      title="Commit changes"
      onClose={onClose}
      width="500px"
      footer={
        <>
          <ModalFooterSpacer />
          <ModalSecondaryButton onClick={onClose}>Cancel</ModalSecondaryButton>
          <ModalPrimaryButton onClick={handleCommit} disabled={!canCommit}>
            <GitCommitHorizontal size={14} />
            {isCommitting
              ? "Committing…"
              : `Commit${selectedCount > 0 ? ` ${selectedCount} file${selectedCount !== 1 ? "s" : ""}` : ""}`}
          </ModalPrimaryButton>
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
        <SkeletonList rows={4} />
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
