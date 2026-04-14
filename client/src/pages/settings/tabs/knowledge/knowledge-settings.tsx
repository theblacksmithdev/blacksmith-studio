import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Plus } from 'lucide-react'
import { useRemoveKnowledge } from '@/api/hooks/knowledge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Text, Badge } from '@/components/shared/ui'
import { useKnowledgeActions } from './hooks/use-knowledge-actions'
import { KnowledgeRow } from './components/knowledge-row'
import { KnowledgeEmptyState } from './components/knowledge-empty-state'
import { KnowledgeCreateModal } from './components/knowledge-create-modal'
import { KnowledgeEditorDrawer } from './components/knowledge-editor-drawer'

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: opacity 0.12s ease;
  &:hover { opacity: 0.85; }
`

const List = styled.div`
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  overflow: hidden;
  background: var(--studio-bg-sidebar);
`

export function KnowledgeSettings() {
  const { docs, modal, setModal, closeModal } = useKnowledgeActions()
  const removeMutation = useRemoveKnowledge()

  const handleRemove = () => {
    if (modal?.type !== 'delete') return
    removeMutation.mutate(modal.name, { onSuccess: closeModal })
  }

  return (
    <Flex direction="column" gap="14px">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Flex align="center" gap="8px" css={{ marginBottom: '4px' }}>
            <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em' }}>
              Knowledge Base
            </Text>
            {docs.length > 0 && <Badge variant="default" size="sm">{docs.length}</Badge>}
          </Flex>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', lineHeight: 1.5 }}>
            Markdown documents Claude reads on every conversation to understand your project.
          </Text>
        </Box>
        {docs.length > 0 && (
          <AddBtn onClick={() => setModal({ type: 'create' })}>
            <Plus size={13} /> Add
          </AddBtn>
        )}
      </Flex>

      {docs.length === 0 ? (
        <KnowledgeEmptyState onCreate={() => setModal({ type: 'create' })} />
      ) : (
        <List>
          {docs.map((doc) => (
            <KnowledgeRow
              key={doc.name}
              name={doc.name}
              size={doc.size}
              updatedAt={doc.updatedAt}
              onEdit={() => setModal({ type: 'edit', name: doc.name })}
              onDelete={() => setModal({ type: 'delete', name: doc.name })}
            />
          ))}
        </List>
      )}

      <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
        Stored in .blacksmith/docs/ — editable with any text editor.
      </Text>

      {modal?.type === 'create' && (
        <KnowledgeCreateModal onClose={closeModal} />
      )}

      {modal?.type === 'edit' && (
        <KnowledgeEditorDrawer name={modal.name} onClose={closeModal} />
      )}

      {modal?.type === 'delete' && (
        <ConfirmDialog
          message={`Delete "${modal.name}"?`}
          description="This will remove the file from .blacksmith/docs/. This cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleRemove}
          onCancel={closeModal}
        />
      )}
    </Flex>
  )
}
