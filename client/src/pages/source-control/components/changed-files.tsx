import styled from '@emotion/styled'
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
  padding: 7px 10px;
  border: none;
  border-radius: 8px;
  background: ${(p) => (p.selected ? 'var(--studio-bg-hover)' : 'transparent')};
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: all 0.12s ease;

  &:hover {
    background: var(--studio-bg-surface);
  }
`

const StatusIndicator = styled.span<{ status: string }>`
  width: 14px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.02em;
  color: ${(p) => {
    switch (p.status) {
      case 'modified': return 'var(--studio-warning)'
      case 'added':
      case 'untracked': return 'var(--studio-green)'
      case 'deleted': return 'var(--studio-error)'
      default: return 'var(--studio-text-muted)'
    }
  }};
`

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--studio-text-secondary);
`

const EmptyMessage = styled.div`
  padding: 20px 12px;
  text-align: center;
  font-size: 14px;
  color: var(--studio-text-muted);
  line-height: 1.6;
`

function statusLetter(status: GitChangedFile['status']): string {
  switch (status) {
    case 'modified': return 'M'
    case 'added': return 'A'
    case 'deleted': return 'D'
    case 'renamed': return 'R'
    case 'untracked': return 'U'
    default: return '?'
  }
}

interface Props {
  files: GitChangedFile[]
  selectedPath?: string
  onSelect: (path: string) => void
}

export function ChangedFilesList({ files, selectedPath, onSelect }: Props) {
  if (files.length === 0) {
    return <EmptyMessage>No uncommitted changes</EmptyMessage>
  }

  return (
    <List>
      {files.map((f) => (
        <FileRow
          key={f.path}
          selected={selectedPath === f.path}
          onClick={() => onSelect(f.path)}
        >
          <StatusIndicator status={f.status}>
            {statusLetter(f.status)}
          </StatusIndicator>
          <FileName>{f.path}</FileName>
        </FileRow>
      ))}
    </List>
  )
}
