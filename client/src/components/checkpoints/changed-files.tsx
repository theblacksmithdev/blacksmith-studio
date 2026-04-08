import styled from '@emotion/styled'
import { FileText, FilePlus, FileX, FileQuestion } from 'lucide-react'
import type { GitChangedFile } from '@/api/types'

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const FileRow = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.selected ? 'var(--studio-bg-hover)' : 'transparent')};
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s ease;

  &:hover {
    background: var(--studio-bg-hover);
  }
`

const Badge = styled.span<{ variant: string }>`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  text-transform: uppercase;
  background: ${(p) => {
    switch (p.variant) {
      case 'modified': return 'rgba(255, 180, 50, 0.15)'
      case 'added':
      case 'untracked': return 'rgba(80, 200, 120, 0.15)'
      case 'deleted': return 'rgba(240, 80, 80, 0.15)'
      default: return 'var(--studio-bg-surface)'
    }
  }};
  color: ${(p) => {
    switch (p.variant) {
      case 'modified': return '#e6a520'
      case 'added':
      case 'untracked': return '#40c870'
      case 'deleted': return '#e04040'
      default: return 'var(--studio-text-muted)'
    }
  }};
`

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

function statusIcon(status: GitChangedFile['status']) {
  switch (status) {
    case 'modified': return <FileText size={14} />
    case 'added':
    case 'untracked': return <FilePlus size={14} />
    case 'deleted': return <FileX size={14} />
    default: return <FileQuestion size={14} />
  }
}

function statusLabel(status: GitChangedFile['status']) {
  switch (status) {
    case 'untracked': return 'new'
    default: return status
  }
}

interface Props {
  files: GitChangedFile[]
  selectedPath?: string
  onSelect: (path: string) => void
}

export function ChangedFilesList({ files, selectedPath, onSelect }: Props) {
  if (files.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--studio-text-muted)', fontSize: '13px' }}>
        No uncommitted changes
      </div>
    )
  }

  return (
    <List>
      {files.map((f) => (
        <FileRow
          key={f.path}
          selected={selectedPath === f.path}
          onClick={() => onSelect(f.path)}
        >
          <span style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }}>
            {statusIcon(f.status)}
          </span>
          <FileName>{f.path}</FileName>
          <Badge variant={f.status}>{statusLabel(f.status)}</Badge>
        </FileRow>
      ))}
    </List>
  )
}
