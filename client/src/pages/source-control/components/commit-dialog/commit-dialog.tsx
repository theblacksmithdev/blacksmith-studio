import { GitCommitHorizontal } from 'lucide-react'
import type { GitChangedFile } from '@/api/types'
import { Modal, ModalFooterSpacer, Button } from '@/components/shared/ui'
import { useCommit } from './hooks'
import { MessageInput, FileList } from './components'

interface CommitDialogProps {
  files: GitChangedFile[]
  onClose: () => void
  onCommitted: () => void
}

export function CommitDialog({ files, onClose, onCommitted }: CommitDialogProps) {
  const {
    message, setMessage, selected,
    toggleFile, toggleAll, handleCommit, regenerateMessage,
    isCommitting, isGenerating, canCommit,
  } = useCommit(files, onCommitted)

  return (
    <Modal
      title="Commit Changes"
      onClose={onClose}
      headerExtra={<GitCommitHorizontal size={16} style={{ color: 'var(--studio-text-muted)' }} />}
      footer={
        <>
          <ModalFooterSpacer />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleCommit} disabled={!canCommit}>
            {isCommitting ? 'Committing...' : 'Commit'}
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
      <FileList
        files={files}
        selected={selected}
        onToggle={toggleFile}
        onToggleAll={toggleAll}
      />
    </Modal>
  )
}
