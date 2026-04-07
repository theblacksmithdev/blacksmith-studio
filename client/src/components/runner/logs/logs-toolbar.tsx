import styled from '@emotion/styled'
import { Trash2, ArrowDown } from 'lucide-react'

export type LogFilter = 'all' | 'backend' | 'frontend'

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-bottom: 1px solid var(--studio-border);
  flex-shrink: 0;
`

const FilterBtn = styled.button<{ active: boolean }>`
  padding: 3px 10px;
  border-radius: 6px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
  font-size: 11px;
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: inherit;

  &:hover {
    color: var(--studio-text-secondary);
  }
`

const Spacer = styled.div`
  flex: 1;
`

const LineCount = styled.span`
  font-size: 10px;
  color: var(--studio-text-muted);
  margin-right: 4px;
`

const IconBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    color: var(--studio-text-secondary);
    background: var(--studio-bg-surface);
  }
`

interface LogsToolbarProps {
  filter: LogFilter
  onFilterChange: (filter: LogFilter) => void
  count: number
  autoScroll: boolean
  onScrollToBottom: () => void
  onClear: () => void
}

export function LogsToolbar({ filter, onFilterChange, count, autoScroll, onScrollToBottom, onClear }: LogsToolbarProps) {
  return (
    <Bar>
      <FilterBtn active={filter === 'all'} onClick={() => onFilterChange('all')}>All</FilterBtn>
      <FilterBtn active={filter === 'backend'} onClick={() => onFilterChange('backend')}>Django</FilterBtn>
      <FilterBtn active={filter === 'frontend'} onClick={() => onFilterChange('frontend')}>Vite</FilterBtn>

      <Spacer />

      <LineCount>{count} lines</LineCount>

      {!autoScroll && (
        <IconBtn onClick={onScrollToBottom} title="Scroll to bottom">
          <ArrowDown size={12} />
        </IconBtn>
      )}

      <IconBtn onClick={onClear} title="Clear logs">
        <Trash2 size={12} />
      </IconBtn>
    </Bar>
  )
}
