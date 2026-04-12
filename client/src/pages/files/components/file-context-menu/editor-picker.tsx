import { useState } from 'react'
import styled from '@emotion/styled'
import { ChevronRight, Check, ExternalLink } from 'lucide-react'
import type { DetectedEditor } from '@/api/modules/files'
import { MenuItem } from './styled'

const SubMenuWrap = styled.div`
  position: relative;
`

const SubMenu = styled.div`
  position: absolute;
  left: 100%;
  top: -4px;
  min-width: 200px;
  padding: 4px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border-hover);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  z-index: 1001;
  animation: ctxFadeIn 0.1s ease;
`

const EditorItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;
  text-align: left;

  &:hover {
    background: var(--studio-bg-hover);
    color: var(--studio-text-primary);
  }
`

const CheckIcon = styled.span`
  margin-left: auto;
  display: flex;
  color: var(--studio-text-muted);
`

interface EditorPickerProps {
  editors: DetectedEditor[]
  preferredCommand: string | null
  onSelect: (command: string) => void
  onSetPreferred: (command: string) => void
}

export function EditorPicker({ editors, preferredCommand, onSelect, onSetPreferred }: EditorPickerProps) {
  const [open, setOpen] = useState(false)

  if (editors.length === 0) {
    return (
      <MenuItem disabled style={{ opacity: 0.5, cursor: 'default' }}>
        <ExternalLink size={14} /> No editors found
      </MenuItem>
    )
  }

  // If only one editor, show direct action
  if (editors.length === 1) {
    return (
      <MenuItem onClick={() => onSelect(editors[0].command)}>
        <ExternalLink size={14} /> Open in {editors[0].name}
      </MenuItem>
    )
  }

  return (
    <SubMenuWrap
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <MenuItem>
        <ExternalLink size={14} />
        Open in Editor
        <ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--studio-text-muted)' }} />
      </MenuItem>

      {open && (
        <SubMenu>
          {editors.map((editor) => (
            <EditorItem
              key={editor.id}
              onClick={() => {
                onSetPreferred(editor.command)
                onSelect(editor.command)
              }}
            >
              {editor.name}
              {editor.command === preferredCommand && (
                <CheckIcon><Check size={13} /></CheckIcon>
              )}
            </EditorItem>
          ))}
        </SubMenu>
      )}
    </SubMenuWrap>
  )
}
