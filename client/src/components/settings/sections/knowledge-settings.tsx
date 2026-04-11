import { useState } from 'react'
import { Box, Flex, Text, VStack, IconButton, Input } from '@chakra-ui/react'
import { Plus, Pencil, Trash2, FileText, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useKnowledge } from '@/hooks/use-knowledge'
import { Drawer } from '@/components/shared/drawer'
import { Modal, PrimaryButton, GhostButton, FooterSpacer } from '@/components/shared/modal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { FormField } from '@/components/shared/form-controls'
import type { KnowledgeDocContent } from '@/api/modules/knowledge'

type ModalState =
  | null
  | { type: 'create' }
  | { type: 'edit'; doc: KnowledgeDocContent }
  | { type: 'delete'; name: string }

export function KnowledgeSettings() {
  const { docs, getDoc, create, save, remove } = useKnowledge()
  const [modal, setModal] = useState<ModalState>(null)
  const [newName, setNewName] = useState('')
  const [editContent, setEditContent] = useState('')

  const handleOpenDoc = async (name: string) => {
    const doc = await getDoc(name)
    if (doc) {
      setEditContent(doc.content)
      setModal({ type: 'edit', doc })
    }
  }

  const handleSave = async () => {
    if (modal?.type === 'edit') {
      await save({ name: modal.doc.name, content: editContent })
      setModal(null)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    await create(newName.trim())
    setNewName('')
    setModal(null)
  }

  return (
    <VStack gap={0} align="stretch">
      {/* Header */}
      <Flex align="flex-start" css={{ marginBottom: '16px' }}>
        <Box css={{ flex: 1 }}>
          <Text css={{ fontSize: '15px', fontWeight: 600, color: 'var(--studio-text-primary)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Knowledge Base
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)' }}>
            Markdown docs that Claude reads on every conversation to understand your project.
          </Text>
        </Box>
        <Box
          as="button"
          onClick={() => setModal({ type: 'create' })}
          css={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 14px', borderRadius: '8px', border: 'none',
            background: 'var(--studio-accent)', color: 'var(--studio-accent-fg)',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            flexShrink: 0, marginTop: '2px', transition: 'opacity 0.12s ease',
            '&:hover': { opacity: 0.85 },
          }}
        >
          <Plus size={13} /> Add Doc
        </Box>
      </Flex>

      {/* List */}
      {docs.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          gap={3}
          css={{
            padding: '40px 20px', textAlign: 'center',
            borderRadius: '10px', border: '1px solid var(--studio-border)',
            background: 'var(--studio-bg-sidebar)',
          }}
        >
          <Box css={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--studio-text-muted)',
          }}>
            <BookOpen size={20} />
          </Box>
          <Text css={{ fontSize: '14px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
            No knowledge docs yet
          </Text>
          <Text css={{ fontSize: '13px', color: 'var(--studio-text-tertiary)', maxWidth: '300px' }}>
            Add markdown files that describe your project's requirements, architecture, and conventions.
          </Text>
          <Box
            as="button"
            onClick={() => setModal({ type: 'create' })}
            css={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid var(--studio-border)', background: 'var(--studio-bg-main)',
              color: 'var(--studio-text-secondary)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit', marginTop: '4px',
              '&:hover': { background: 'var(--studio-bg-surface)', borderColor: 'var(--studio-border-hover)', color: 'var(--studio-text-primary)' },
            }}
          >
            <Plus size={13} /> Add Doc
          </Box>
        </Flex>
      ) : (
        <VStack
          gap={0}
          align="stretch"
          css={{
            borderRadius: '10px', border: '1px solid var(--studio-border)',
            overflow: 'hidden', background: 'var(--studio-bg-sidebar)',
          }}
        >
          {docs.map((doc) => (
            <Flex
              key={doc.name}
              align="center"
              gap={3}
              onClick={() => handleOpenDoc(doc.name)}
              css={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--studio-border)',
                transition: 'background 0.1s ease',
                cursor: 'pointer',
                '&:last-child': { borderBottom: 'none' },
                '&:hover': {
                  background: 'var(--studio-bg-surface)',
                  '& .doc-actions': { opacity: 1 },
                },
              }}
            >
              <Box css={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--studio-text-muted)', flexShrink: 0,
              }}>
                <FileText size={14} />
              </Box>

              <Box css={{ flex: 1, minWidth: 0 }}>
                <Text css={{ fontSize: '13px', fontWeight: 500, color: 'var(--studio-text-primary)' }}>
                  {doc.name}
                </Text>
                <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '2px' }}>
                  {(doc.size / 1024).toFixed(1)} KB · {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </Text>
              </Box>

              <Flex
                gap={1}
                className="doc-actions"
                css={{ opacity: 0, transition: 'opacity 0.1s ease', flexShrink: 0 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <IconButton
                  aria-label="Delete"
                  size="xs"
                  variant="ghost"
                  onClick={() => setModal({ type: 'delete', name: doc.name })}
                  css={{
                    color: 'var(--studio-text-muted)', borderRadius: '6px',
                    '&:hover': { background: 'var(--studio-error-subtle)', color: 'var(--studio-error)' },
                  }}
                >
                  <Trash2 size={13} />
                </IconButton>
              </Flex>
            </Flex>
          ))}
        </VStack>
      )}

      <Text css={{ fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '10px' }}>
        Stored in .blacksmith/docs/ — editable with any text editor.
      </Text>

      {/* Create modal */}
      {modal?.type === 'create' && (
        <Modal
          title="New Knowledge Doc"
          onClose={() => { setModal(null); setNewName('') }}
          width="400px"
          footer={
            <>
              <FooterSpacer />
              <GhostButton onClick={() => { setModal(null); setNewName('') }}>Cancel</GhostButton>
              <PrimaryButton disabled={!newName.trim()} onClick={handleCreate}>Create</PrimaryButton>
            </>
          }
        >
          <FormField label="Filename" hint="Will be saved as a .md file">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. requirements, api-spec, design-system"
              autoFocus
              css={{
                padding: '8px 12px', borderRadius: '8px',
                border: '1px solid var(--studio-border)', background: 'var(--studio-bg-inset)',
                color: 'var(--studio-text-primary)', fontSize: '13px',
                '&:focus': { borderColor: 'var(--studio-border-hover)', boxShadow: 'none' },
                '&::placeholder': { color: 'var(--studio-text-muted)' },
              }}
            />
          </FormField>
        </Modal>
      )}

      {/* Edit drawer */}
      {modal?.type === 'edit' && (
        <Drawer
          title={modal.doc.name}
          onClose={() => setModal(null)}
          placement="right"
          size="720px"
          footer={
            <>
              <FooterSpacer />
              <GhostButton onClick={() => setModal(null)}>Cancel</GhostButton>
              <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
            </>
          }
        >
          <Flex direction="column" css={{ flex: 1, minHeight: 0 }}>
            <MarkdownEditor
              value={editContent}
              onChange={setEditContent}
              fill
            />
          </Flex>
        </Drawer>
      )}

      {/* Delete confirm */}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          title="Delete Document"
          message={`Delete "${modal.name}"?`}
          description="This will remove the file from .blacksmith/docs/. This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={async () => { await remove(modal.name); setModal(null) }}
          onCancel={() => setModal(null)}
        />
      )}
    </VStack>
  )
}
