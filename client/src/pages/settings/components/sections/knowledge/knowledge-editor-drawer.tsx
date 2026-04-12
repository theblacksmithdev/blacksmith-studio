import { Flex } from '@chakra-ui/react'
import { FileText } from 'lucide-react'
import { Drawer, Button } from '@/components/shared/ui'
import { MarkdownEditor } from '@/components/shared/markdown-editor'

interface KnowledgeEditorDrawerProps {
  name: string
  content: string
  onContentChange: (v: string) => void
  onSave: () => void
  onClose: () => void
}

export function KnowledgeEditorDrawer({ name, content, onContentChange, onSave, onClose }: KnowledgeEditorDrawerProps) {
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
          <Button variant="primary" size="md" onClick={onSave}>Save</Button>
        </Flex>
      }
    >
      <Flex direction="column" css={{ flex: 1, minHeight: 0 }}>
        <MarkdownEditor value={content} onChange={onContentChange} fill />
      </Flex>
    </Drawer>
  )
}
