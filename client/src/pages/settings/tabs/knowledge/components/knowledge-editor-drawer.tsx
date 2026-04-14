import { useState } from 'react'
import { Flex, Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { FileText, Pencil, Eye } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { Drawer, Button } from '@/components/shared/ui'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'
import { useThemeMode } from '@/hooks/use-theme-mode'
import { useKnowledgeDoc } from '../hooks/use-knowledge-doc'

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const PreviewWrap = styled.div`
  padding: 20px 24px;
  height: 100%;
  overflow-y: auto;
`

const EmptyPreview = styled.div`
  color: var(--studio-text-muted);
  font-size: 14px;
  font-style: italic;
  padding: 20px 24px;
`

interface KnowledgeEditorDrawerProps {
  name: string
  onClose: () => void
}

export function KnowledgeEditorDrawer({ name, onClose }: KnowledgeEditorDrawerProps) {
  const { editContent, setEditContent, save, isSaving } = useKnowledgeDoc(name)
  const [editing, setEditing] = useState(false)
  const { mode: themeMode } = useThemeMode()

  const handleSave = () => save(() => { setEditing(false); onClose() })

  return (
    <Drawer
      title={name}
      subtitle="Knowledge document"
      onClose={onClose}
      placement="end"
      size="lg"
      noPadding
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
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <Eye size={13} /> Preview
              </Button>
              <Flex flex={1} />
              <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Flex flex={1} />
              <Button variant="secondary" size="md" onClick={() => setEditing(true)}>
                <Pencil size={13} /> Edit
              </Button>
            </>
          )}
        </Flex>
      }
    >
      <Content>
        {editing ? (
          <Box css={{ height: '100%' }}>
            <Editor
              height="100%"
              language="markdown"
              theme={themeMode === 'dark' ? 'vs-dark' : 'light'}
              value={editContent}
              onChange={(v) => setEditContent(v ?? '')}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                glyphMargin: false,
                folding: false,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                fontSize: 13,
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
                lineHeight: 20,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'none',
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                scrollbar: { vertical: 'auto', horizontal: 'hidden', verticalScrollbarSize: 6 },
              }}
            />
          </Box>
        ) : editContent.trim() ? (
          <PreviewWrap>
            <MarkdownRenderer content={editContent} />
          </PreviewWrap>
        ) : (
          <EmptyPreview>This document is empty. Click Edit to add content.</EmptyPreview>
        )}
      </Content>
    </Drawer>
  )
}
