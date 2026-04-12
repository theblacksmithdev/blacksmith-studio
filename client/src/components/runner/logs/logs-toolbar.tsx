import { useState } from 'react'
import styled from '@emotion/styled'
import { Trash2, ArrowDown, Search, Clock, X } from 'lucide-react'

export type LogFilter = 'all' | string

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
  font-size: 12px;
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
  font-size: 11px;
  color: var(--studio-text-muted);
  margin-right: 4px;
`

const IconBtn = styled.button<{ active?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: ${({ active }) => (active ? 'var(--studio-bg-hover)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--studio-text-primary)' : 'var(--studio-text-muted)')};
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

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
`

const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: var(--studio-text-primary);
  font-size: 12px;
  width: 120px;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: var(--studio-text-muted);
  }
`

const ClearSearchBtn = styled.button`
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;

  &:hover {
    color: var(--studio-text-primary);
  }
`

interface LogsToolbarProps {
  filter: LogFilter
  onFilterChange: (filter: LogFilter) => void
  serviceNames: { id: string; name: string }[]
  count: number
  autoScroll: boolean
  onScrollToBottom: () => void
  onClear: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  showTimestamps: boolean
  onToggleTimestamps: () => void
}

export function LogsToolbar({
  filter, onFilterChange, serviceNames, count, autoScroll, onScrollToBottom, onClear,
  searchTerm, onSearchChange, showTimestamps, onToggleTimestamps,
}: LogsToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(!!searchTerm)

  const handleCloseSearch = () => {
    onSearchChange('')
    setSearchOpen(false)
  }

  return (
    <Bar>
      <FilterBtn active={filter === 'all'} onClick={() => onFilterChange('all')}>All</FilterBtn>
      {serviceNames.map((svc) => (
        <FilterBtn
          key={svc.id}
          active={filter === svc.id}
          onClick={() => onFilterChange(svc.id)}
        >
          {svc.name}
        </FilterBtn>
      ))}

      <Spacer />

      {searchOpen ? (
        <SearchWrap>
          <Search size={11} style={{ color: 'var(--studio-text-muted)', flexShrink: 0 }} />
          <SearchInput
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter logs..."
            autoFocus
          />
          <ClearSearchBtn onClick={handleCloseSearch}>
            <X size={11} />
          </ClearSearchBtn>
        </SearchWrap>
      ) : (
        <IconBtn onClick={() => setSearchOpen(true)} title="Search logs">
          <Search size={12} />
        </IconBtn>
      )}

      <IconBtn active={showTimestamps} onClick={onToggleTimestamps} title="Toggle timestamps">
        <Clock size={12} />
      </IconBtn>

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
