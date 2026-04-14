import { Flex } from '@chakra-ui/react'
import { FileText } from 'lucide-react'
import { Drawer, Button } from '@/components/shared/ui'
import { MarkdownEditor } from '@/components/shared/markdown-editor'
import { useKnowledgeDoc } from '../hooks/use-knowledge-doc'

interface KnowledgeEditorDrawerProps {
  name: string
  onClose: () => void
}

export function KnowledgeEditorDrawer({ name, onClose }: KnowledgeEditorDrawerProps) {
  const { editContent, setEditContent, save, isSaving } = useKnowledgeDoc(name)

  const handleSave = () => save(onClose)

  return (
    <Drawer
      title={name}
      subtitle="Edit knowledge document"
      onClose={onClose}
      placement="end"
      size="lg"
      headerExtra={
        <Flex css={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'var(--studio-bg-surface)', border: '1px solid var(--studio-border)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'var(--studio-text-muted)',
        }}>
          <FileText size={14} />
        </Flex>
      }
      footer={
        <Flex align="center" gap="8px" css={{ width: '100%' }}>
          <Flex flex={1} />
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" css={{ flex: 1, minHeight: 0 }}>
        <MarkdownEditor value={editContent} onChange={setEditContent} fill />
      </Flex>
    </Drawer>
  )
}
