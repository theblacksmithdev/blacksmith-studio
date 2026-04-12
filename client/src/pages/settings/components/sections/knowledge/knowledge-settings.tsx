import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Plus } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Text, Badge } from '@/components/shared/ui'
import { useKnowledgeActions } from './use-knowledge-actions'
import { KnowledgeRow } from './knowledge-row'
import { KnowledgeEmptyState } from './knowledge-empty-state'
import { KnowledgeCreateModal } from './knowledge-create-modal'
import { KnowledgeEditorDrawer } from './knowledge-editor-drawer'

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
  const {
    docs, modal, setModal,
    newName, setNewName,
    editContent, setEditContent,
    openDoc, handleCreate, handleSave, handleRemove, closeModal,
  } = useKnowledgeActions()

  return (
    <Flex direction="column" gap="14px">
      {/* Header */}
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

      {/* Content */}
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
              onEdit={() => openDoc(doc.name)}
              onDelete={() => setModal({ type: 'delete', name: doc.name })}
            />
          ))}
        </List>
      )}

      <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)' }}>
        Stored in .blacksmith/docs/ — editable with any text editor.
      </Text>

      {/* Create modal */}
      {modal?.type === 'create' && (
        <KnowledgeCreateModal
          name={newName}
          onNameChange={setNewName}
          onCreate={handleCreate}
          onClose={closeModal}
        />
      )}

      {/* Edit drawer */}
      {modal?.type === 'edit' && (
        <KnowledgeEditorDrawer
          name={modal.doc.name}
          content={editContent}
          onContentChange={setEditContent}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Delete confirm */}
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
